function Builder(client, specs) {
    this.client = client;
    this.specs = specs || [];
}

Builder.prototype.follow = function (rel, params) {
    var spec = {rel: rel, params: params, follow: []};
    this.specs.push(spec);

    return new Builder(this.client, spec.follow);
};

Builder.prototype.get = function () {
    return this.client.request(this.specs);
};

module.exports = Builder;