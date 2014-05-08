var data = require('./dump');

exports.index = function *() {
    this.body = data;
};

exports.detail = function *() {
    var user = data[this.params.id];

    if (user) this.body = user;
    else this.throw(404);
};
