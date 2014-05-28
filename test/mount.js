var koa = require('koa');
var request = require('supertest');
var http = require('http');

function basicSecretGetter(id) { return id === 'foo' && 'bar' }

it('Should  mount path "/" when dir path is "pages"', function(done) {
    var mountPages = require('../index')('pages');
    var app = koa();

    mountPages(app);

    request(http.createServer(app.callback()))
        .get('/')
        .expect(200)
        .end(done);
});

it('Should  mount path "/" when dir path is "pages/"', function(done) {
    var mountPages = require('../index')('pages/');
    var app = koa();

    mountPages(app);

    request(http.createServer(app.callback()))
        .get('/')
        .expect(200)
        .end(done);
});

it('Should mount path "/users/"', function(done) {
    var mountApi = require('../index')('api/v1');
    var app = koa();

    mountApi(app);

    request(http.createServer(app.callback()))
        .get('/users')
        .expect(200)
        .end(done);
});

it('Should mount path "/api/v1/users/" when prefix is "/api/v1"', function(done) {
    var mountApi = require('../index')('api/v1', { prefix: '/api/v1' });
    var app = koa();

    mountApi(app);

    request(http.createServer(app.callback()))
        .get('/api/v1/users')
        .expect(200)
        .end(done);
});

it('Should mount path "/api/v1/users/" when prefix is "/api/v1/"', function(done) {
    var mountApi = require('../index')('api/v1', { prefix: '/api/v1' });
    var app = koa();

    mountApi(app);

    request(http.createServer(app.callback()))
        .get('/api/v1/users')
        .expect(200)
        .end(done);
});

it('Should mount path "/api/v1/users/" when prefix is "api/v1"', function(done) {
    var mountApi = require('../index')('api/v1', { prefix: '/api/v1' });
    var app = koa();

    mountApi(app);

    request(http.createServer(app.callback()))
        .get('/api/v1/users')
        .expect(200)
        .end(done);
});

it('Should mount path "/users/:id""', function(done) {
    var mountApi = require('../index')('api/v1');
    var app = koa();

    mountApi(app);

    request(http.createServer(app.callback()))
        .get('/users/1')
        .expect(200)
        .end(done);
});

it('Should response with 501 status if not POST method', function(done) {
    var mountPages = require('../index')('views');
    var app = koa();

    mountPages(app);

    request(http.createServer(app.callback()))
        .get('/test')
        .expect(501)
        .end(done);
});

it('Should mount path "/test for POST method"', function(done) {
    var mountPages = require('../index')('views');
    var app = koa();

    mountPages(app);

    request(http.createServer(app.callback()))
        .post('/test')
        .expect(200)
        .end(done);
});

it('Should not throw error', function(done) {
    var mountPages = require('../index')('config');
    var app = koa();

    mountPages(app);

    request(http.createServer(app.callback()))
        .get('/')
        .expect(200)
        .end(done);
});

it('Should have access', function(done) {
    var mountPages = require('../index')('basic', { auth: { basic: basicSecretGetter } });
    var app = koa();

    mountPages(app);

    request(http.createServer(app.callback()))
        .get('/resource')
        .set('Authorization', 'basic Zm9vOmJhcg==')
        .expect(200)
        .end(done);
});

it('Should response with 401 code', function(done) {
    var mountPages = require('../index')('basic', { auth: { basic: basicSecretGetter } });
    var app = koa();

    mountPages(app);

    request(http.createServer(app.callback()))
        .get('/resource')
        .expect(401)
        .end(done);
});

it('Should response with 403 code', function(done) {
    var mountPages = require('../index')('basic', { auth: { basic: basicSecretGetter } });
    var app = koa();

    mountPages(app);

    request(http.createServer(app.callback()))
        .get('/resource')
        .set('Authorization', 'basic Zm9vOmJheg==')
        .expect(403)
        .end(done);
});

