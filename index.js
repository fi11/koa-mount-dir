var path = require('path');
var fs = require('fs');
var readdir = fs.readdirSync;
var debug = require('debug')('http');
var router = require('koa-router');
var basicAuth = require('basic-auth');

function route(app, conf, options) {
    debug('routes: %s', conf.name);
    var mod = require(conf.directory);

    for (var key in conf.routes) {
        var property = conf.routes[key];
        var method = key.split(' ')[0];
        var path = '/' + (options.prefix || '') + key.split(' ')[1].replace(/^\/+/, '');

        debug('%s %s -> .%s', method, path, property);

        var fn = mod[property];
        if (!fn) throw new Error(conf.name + ': exports.' + property + ' is not defined');


        if (conf.auth === 'basic') {
            fn = wrapBasic(fn, (options.auth || {}).basic);
        }
        
        app[method.toLowerCase()](path, fn);
    }
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


