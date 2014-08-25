var path = require('path');
var fs = require('fs');
var readdir = fs.readdirSync;
var debug = require('debug')('http');
var router = require('koa-router');
var basicAuth = require('basic-auth');
var validator = require('jsonschema').validate;
var bodyParser = require('co-body');
var qs = require('querystring');

function route(app, conf, options) {
    debug('routes: %s', conf.name);
    var mod = require(conf.directory);

    Object.keys(conf.routes || {}).forEach(function(key) {
        var splittedKey = key.split(' ');
        var property =  conf.routes[key];
        var routeProperties = typeof property === 'string' ? { handler: property, params: null } : property;
        var fnName = routeProperties.handler;
        var method = splittedKey[0];
        var path = '/' + (options.prefix || '') + splittedKey[1].replace(/^\/+/, '');

        debug('%s %s -> .%s', method, path, fnName);

        var fn = mod[fnName];

        if (!fn) throw new Error(conf.name + ': exports.' + fnName + ' is not defined');

        if (routeProperties.params) {
            fn = wrapParamsValidation(fn, routeProperties.params);
        }

        if (conf.auth === 'basic') {
            fn = wrapBasic(fn, (options.auth || {}).basic);
        }

        app[method.toLowerCase()](path, fn);

    }, this);
}

function wrapBasic(fn, secretGetter) {
    return function *(next) {
        var auth = basicAuth(this.req);
        if (!auth) this.throw(401);

        var secret = secretGetter(auth.name);
        if (!secret || secret !== auth.pass) this.throw(403);

        this.req.apiKey = { id: auth.name, secret: secret };

        yield fn.call(this, next);
    }
}

function wrapParamsValidation(fn, schema) {
    return function *(next) {
        var data = qs.parse(this.querystring) || {};
        
        try {
            var body = yield bodyParser(this.req);
        } catch (err) {
            return this.throw(500, err);
        }

        Object.keys(body || {}).forEach(function(key) {
            data[key] = body[key];
        });

        try {
            var validateResult = validator(data, schema);
        }  catch (err) {
            return this.throw(500, err);
        }

        if (validateResult.errors.length) {
            var errors = validateResult.errors.map(function(err) { return err.stack; });
            this.status = 400;

            return this.body = errors;
        }

        this.req.params = data;
        yield fn.call(this, next);
    }
}

module.exports = function(resourcePath, options) {
    options = options || {};

    var resourcePath = path.join(path.dirname(module.parent.filename), resourcePath);

    if (options.prefix) options.prefix = (options.prefix || '').replace(/^\/+|\/+$/g, '') + '/';

    return function(app) {
        app.use(router(app));

        readdir(resourcePath).forEach(function(item) {
            var dir = path.resolve(path.join(resourcePath, item));

            try {
                var conf = require(path.resolve(path.join(resourcePath, item, '/config.json')));
            } catch(err) {
                if (err.code === 'MODULE_NOT_FOUND') return;
                else throw err;
            }

            conf.directory = dir;

            if (conf.routes) route(app, conf, options);
        });
    }
};
