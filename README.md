Simple routing lib for [Koa](https://github.com/koajs/koa) based on
[this](https://github.com/koajs/api-boilerplate/blob/master/lib/load.js) code.

## Installation

```
$ npm install koa-mount-dir
```

## Example

File structure:

-api
  -users
    -config.json
    -index.js
-pages
  -home
    -config.json
    -index.js
-app.js

In config.json:
```json
{
    "routes": {
        "GET /path/to/": "detail"
    }
}
```
Where "GET /path/to/" is http method with routing path and "detail" is handler name witch exports in index.js

index.js source:
```js
exports.detail = function *() { this.body = 'ok' }
```

app.js source:
```js
var koa = require('koa');
var app = koa();

var mountPages = require('koa-mount-dir')('pages');

// first argument "api" is path to mount dir and second argument is prefix to path ('/users/' -> /api/v1/users/)
var mountApi = require('koa-mount-dir')('api', '/api/v1');

// for mount ./api dir with path prefix "/api/v1"
mountApi(app);

// for mount ./pages dir
mountPages(app);

app.listen(8000);
```

For running example

```
$ make example
```

## Running tests

```
$ make test
```

## Authors

  - [Pavel Silin](https://github.com/fi11)

# License

  MIT
