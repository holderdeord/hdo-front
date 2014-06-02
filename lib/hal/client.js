var Promise       = require('bluebird'),
    halfred       = require('halfred'),
    parseTemplate = require('uri-template').parse,
    Builder       = require('./builder'),
    merge         = require('deepmerge'),
    LRU           = require('lru-cache'),
    Eu            = require('eu');

// halfred.enableValidation();

function isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
}

function HalClient(url, opts) {
    this.url = url;
    this.opts = merge(HalClient.DEFAULTS, opts || {});

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

HalClient.DEFAULTS = {
    next: 'next'
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

        var next = [];

        if (spec.paginate) {
            var resultArray = resources[0]._embedded[spec.rel];
            next.push(self._paginate(resultArray, res, spec));
        }

        if (spec.follow && spec.follow.length) {
            next.push(self._request(res, spec.follow, data));
        }

        return Promise.all(next);
    }

    if (!links) {
        var embeddedRelation = resource.embeddedResourceArray(spec.rel);

        if (embeddedRelation) {
            console.log('... embedded relation: ' + spec.rel);

            return Promise.map(embeddedRelation, save);
        } else {
            throw new Error('relation "' + spec.rel + '" not found in ' + JSON.stringify(resource.original()));
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

HalClient.prototype._paginate = function (resultArray, resource, spec) {
    var nextRelationName = this.opts.next,
        nextLink         = resource.link(nextRelationName),
        self             = this;

    if (!isArray(resultArray)) {
        throw new Error('expected array, got: ' + resultArray);
    }

    if (!nextLink) {
        console.log('... pagination link  "' + nextRelationName + '" not found in ' +
                    JSON.stringify(resource.allLinks()) + ', assuming end of collection');

        return Promise.resolve();
    } else if (nextLink.templated) {
        throw new Error('templated pagination links are not supported: ' + JSON.stringify(nextLink));
    } else {
        return this._fetch(nextLink.href).then(function (nextResource) {
            nextResource.embeddedResourceArray(spec.rel).forEach(function (e) { resultArray.push(e.original()); });

            if (spec.max && resultArray.length >= spec.max) {
                return Promise.resolve();
            } else {
                return self._paginate(resultArray, nextResource, spec);
            }
        });
    }
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

module.exports = function(url, opts) {
    return new HalClient(url, opts);
};
