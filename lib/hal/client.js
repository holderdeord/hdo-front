var Promise       = require('bluebird'),
    halfred       = require('halfred'),
    parseTemplate = require('uri-template').parse,
    request       = Promise.promisify(require('request')),
    Builder       = require('./builder'),
    NaiveCache    = require('./naive-cache');

halfred.enableValidation();

/*

- result object should
    (a) put relations in _embedded, or
    (b) build meta-object {resource: {...}, relations: {...}}
- caching

*/

function HalClient(url) {
    this.url = url;
    this.cache = new NaiveCache();
}

HalClient.prototype.request = function(specs) {
    var result = {},
        self   = this;

    if (!(specs instanceof Array)) {
        throw Error('invalid spec: ' + JSON.stringify(specs));
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

                var data = res.original();
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
    var links = resource.linkArray(spec.rel);

    if (!links) {
        throw 'relation ' + spec.rel + ' not found in ' + JSON.stringify(links);
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

    var self = this,
        hit  = this.cache.fetch(url);

    if (hit) {
        console.log('...', 'CACHE HIT');
        return Promise.resolve(hit);
    } else {
        console.log('...', 'CACHE MISS');
    }

    return request({
        method: 'GET',
        url: url,
        headers: {
            'User-Agent': 'hdo-front',
            'Accept': 'application/hal+json'
        }
    }).spread(function(response, body) {
        console.log('...', response.statusCode, response.request.uri.href);

        if (response.statusCode < 200 || response.statusCode > 299) {
            var error = new Error(body);
            error.httpStatus = response.statusCode;
            throw error;
        }

        var result = halfred.parse(JSON.parse(body));
        self.cache.save(url, result, 60);

        return result;
    });
};

HalClient.prototype.builder = function () {
    return new Builder(this);
};

module.exports = function(url) {
    return new HalClient(url);
};