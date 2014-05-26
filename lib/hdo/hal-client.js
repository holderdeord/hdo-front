var Promise = require('bluebird'),
    halfred = require('halfred'),
    parseTemplate = require('uri-template').parse,
    request = Promise.promisify(require('request'));

halfred.enableValidation();

//
// TODO:
// - handle array relations
// - response object should be structured like resource relationships
// - tests
// - caching?

function HalClient(parent) {
    this.parent = parent;
    this.rels = [];
}

HalClient.prototype.href = function(url) {
    this.rels.push({
        href: url
    });

    return new HalClient(this);
};

HalClient.prototype.follow = function(rel, params) {
    this.rels.push({
        rel: rel,
        params: params || {}
    });

    return new HalClient(this);
};

HalClient.prototype.dump = function() {
    if (this.parent) {
        this.parent.dump();
    }

    console.log(JSON.stringify(this, null, ' '));
};

HalClient.prototype.get = function() {
    var self = this;

    function fetchRels() {
        return Promise.all(
            self.rels.map(self._fetchRelation.bind(self))
        ).then(function() {
            return self._merge();
        });
    }

    if (self.parent) {
        return self.parent.get().then(fetchRels);
    } else {
        return fetchRels();
    }
};

HalClient.prototype._fetchRelation = function(rel) {
    var href;

    if (rel.rel) {
        var link;

        this.parent.rels.some(function(r) {
            link = r.resource.link(rel.rel);
            return link;
        });

        if (!link) {
            rel.resource = halfred.parse({});
            return Promise.resolve();
        }

        if (link.templated) {
            href = parseTemplate(link.href).expand(rel.params);
        } else {
            href = link.href;
        }
    } else if (rel.href) {
        href = rel.href;
    }

    return this._fetch(href).then(function(resource) {
        rel.resource = resource;
    });

};

HalClient.prototype._merge = function(childData) {
    var resp = {};

    this.rels.forEach(function(rel) {
        if (rel.rel) {
            resp[rel.rel] = rel.resource.original();
        }
    });

    if (childData) {
        Object.keys(childData).forEach(function(key) {
            resp[key] = childData[key];
        });
    }

    if (this.parent) {
        resp = this.parent._merge(resp);
    }

    return resp;
};

HalClient.prototype._fetch = function(url) {
    console.log('fetching url', url);

    if (HalClient.fake) {
        return Promise.resolve(halfred.parse(HalClient.fakeResponses[url]));
    } else {
        return request({
            method: 'GET',
            url: url,
            headers: {
                'User-Agent': 'hdo-front',
                'Accept': 'application/hal+json'
            }
        }).spread(function(response, body) {
            console.log('got response', response.statusCode);

            if (response.statusCode < 200 || response.statusCode > 299) {
                var error = new Error(body);
                error.httpStatus = response.statusCode;
                throw error;
            }

            return halfred.parse(JSON.parse(body));
        });
    }
};

module.exports = function(url) {
    var client = new HalClient();

    if (url) {
        return client.href(url);
    } else {
        return client;
    }
};