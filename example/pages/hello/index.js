var parse = require('co-body');

exports.index = function *() {
    this.body = '<h1>Welcome to hello page!</h1><div><form method="POST" action="/hello/"><input name="name" type="text" placeholder="Input your name"><button type="submit">Send</button></form></div>';
};

exports.detail = function *() {
    var name = this.params.name;

    if (!name) {
        var body = yield parse(this);
        name = body.name;
    }

    if (name) this.body = '<h1>Hello, ' + name + '!</h1><p><a href="/hello/">Return to hello page</a></p>';
    else this.throw(404);
};
