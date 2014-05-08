var koa = require('koa');
var mountPages = require('../index')('pages');
var mountApi = require('../index')('api', '/api/v1');
var json = require('koa-json');

var app = koa();


app.use(json());

// paths: "/api/v1/users/" and "/api/v1/users/1/"
mountApi(app);

// paths: "/", "/hello/" and "/hello/Jon/"
mountPages(app);

app.listen(8000);
