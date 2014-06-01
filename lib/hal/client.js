var Promise       = require('bluebird'),
    halfred       = require('halfred'),
    parseTemplate = require('uri-template').parse,
    Builder       = require('./builder'),
    merge         = require('deepmerge'),
    LRU           = require('lru-cache'),
    Eu            = require('eu');

halfred.enableValidation();

function isArray(o) {
  return Object.prototype.toString.call(o) === '[object Array]';
}

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
            return halfred.parse(result);
        });
    });
};

HalClient.prototype._request = function (parentResource, specs, result) {
    var self = this;

    return Promise.map(specs, function (spec) {
        return self._getRelation(parentResource, spec, result);
    });
};

HalClient.prototype._getRelation = function (resource, spec, result) {
    var self = this,
        links = resource.linkArray(spec.rel);

    function save(res) {
        var embedded = result._embedded = result._embedded || {},
            resources = embedded[spec.rel] = embedded[spec.rel] || [];

        if (!isArray(resources)) {
            embedded[spec.rel] = resources = [resources];
        }

        var data = merge({}, res.original());
        resources.push(data);

        if (spec.follow && spec.follow.length) {
            return self._request(res, spec.follow, data);
        } else {
            return Promise.resolve();
        }
    }

    if (!links) {
        var embeddedRelation = resource.embeddedResourceArray(spec.rel);

        if (embeddedRelation) {
            console.log('...embedded relation: ' + spec.rel);

            return Promise.map(embeddedRelation, save);
        } else {
            throw new Error('relation ' + spec.rel + ' not found in ' + JSON.stringify(links));
        }
    }

    return Promise.all(links.map(function(link) {
        if (link.templated) {
            return parseTemplate(link.href).expand(spec.params || {});
        } else {
            return link.href;
        }
    }).map(function(href) { return self._fetch(href).then(save); }));
};

HalClient.prototype._fetch = function (url) {
    console.log('fetching', url);
    var fetchBegin = new Date();

    return this.eu.getAsync(url, HalClient.REQUEST_OPTIONS).spread(function(response, body) {
        console.log('...', response.statusCode,
                    new Date().getTime() - fetchBegin.getTime() + 'ms',
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
