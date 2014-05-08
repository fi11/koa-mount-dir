var path = require('path');
var fs = require('fs');
var readdir = fs.readdirSync;
var debug = require('debug')('http');
var router = require('koa-router');

function route(app, conf, prefix) {
    debug('routes: %s', conf.name);
    var mod = require(conf.directory);

    for (var key in conf.routes) {
        var property = conf.routes[key];
        var method = key.split(' ')[0];
        var path = '/' + (prefix || '') + key.split(' ')[1].replace(/^\/+/, '');

        debug('%s %s -> .%s', method, path, property);

        var fn = mod[property];
        if (!fn) throw new Error(conf.name + ': exports.' + property + ' is not defined');

        app[method.toLowerCase()](path, fn);
    }
}

module.exports = function(resourcePath, prefix) {
    var resourcePath = path.join(path.dirname(module.parent.filename), resourcePath);
    if (prefix) prefix = prefix.replace(/^\/+|\/+$/g, '') + '/';

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

            if (conf.routes) route(app, conf, prefix);
        });
    }
};


