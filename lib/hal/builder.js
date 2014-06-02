
function Builder(client, specs) {
    this.client = client;
    this.specs = specs || [];
}

Builder.prototype.follow = function (rel, params, opts) {
    var spec = {rel: rel, params: params, follow: []};

    if (opts && opts.paginate) {
        spec.paginate = true;
    }

    if (opts && opts.max) {
        spec.max = opts.max;
    }

    this.specs.push(spec);

    return new Builder(this.client, spec.follow);
};

Builder.prototype.paginate = function (max) {
    this.specs[0].paginate = max || true;
};

Builder.prototype.get = function () {
    return this.client.request(this.specs);
};

module.exports = Builder;