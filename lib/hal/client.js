var Promise       = require('bluebird'),
    halfred       = require('halfred'),
    parseTemplate = require('uri-template').parse,
    Builder       = require('./builder'),
    merge         = require('deepmerge'),
    LRU           = require('lru-cache'),
    Eu            = require('eu');

halfred.enableValidation();

/*

TODO:

* result object should
    (a) put relations in _embedded, or
    (b) build meta-object {resource: {...}, relations: {...}}
*/

function HalClient(url) {
    this.url = url;

    var store = new Eu.MemoryStore(new LRU({max: 500}));
    var cache = new Eu.Cache(store);

    this.eu = Promise.promisifyAll(new Eu(cache));
}

HalClient.REQUEST_OPTIONS = {
    forever: true,
    headers: {
        'User-Agent': 'hdo-front',
        'Accept': 'application/hal+json'
    }
};

HalClient.prototype.request = function(specs) {
    var result = {},
        self   = this;

    if (!(specs instanceof Array)) {
        throw new Error('invalid spec: ' + JSON.stringify(specs));
    }

    return self._fetch(self.url).then(function (resource) {
        return self._request(resource, specs, result).then(function () {
            return result;
        });
    });
};

HalClient.prototype._request = function (parentResource, specs, result) {
    var self = this;

    return Promise.map(specs, function (spec) {
        return Promise.map(self._resolve(parentResource, spec), function(href) {
            return self._fetch(href).then(function (res) {
                result[spec.rel] = result[spec.rel] || [];

                var data = merge({}, res.original());
                result[spec.rel].push(data);

                if (spec.follow && spec.follow.length) {
                    return self._request(res, spec.follow, data);
                } else {
                    return Promise.resolve();
                }
            });
        });
    });
};

HalClient.prototype._resolve = function resolve(resource, spec) {
    // TODO: if resource has spec.rel in embedded, use that without fetching

    var links = resource.linkArray(spec.rel);

    if (!links) {
        throw new Error('relation ' + spec.rel + ' not found in ' + JSON.stringify(links));
    }

    return links.map(function(link) {
        if (link.templated) {
            return parseTemplate(link.href).expand(spec.params || {});
        } else {
            return link.href;
        }
    });
};


HalClient.prototype._fetch = function (url) {
    console.log('fetching', url);
    var fetchBegin = new Date();

    return this.eu.getAsync(url, HalClient.REQUEST_OPTIONS).spread(function(response, body) {
        console.log('...', response.statusCode,
            new Date().getTime() - fetchBegin.getTime() + 'ms',
            'x-cache=' + (response.headers['x-cache']),
            url);

        if (response.statusCode < 200 || response.statusCode > 299) {
            var error = new Error(body);
            error.httpStatus = response.statusCode;
            throw error;
        }

        return halfred.parse(JSON.parse(body));
    });
};

HalClient.prototype.builder = function () {
    return new Builder(this);
};

module.exports = function(url) {
    return new HalClient(url);
};