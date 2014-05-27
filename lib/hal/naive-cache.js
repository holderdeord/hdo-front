var moment = require('moment');

function NaiveCache() {
    this.store = {};
}

NaiveCache.prototype.fetch = function (key) {
    var entry = this.store[key];

    if (entry) {
        if (entry.expires.diff(moment(), 'seconds') > 0) {
            return entry.value;
        } else {
            delete this.store[key];
        }
    }

    return null;
};

NaiveCache.prototype.save = function(key, value, ttl) {
    this.store[key] = {
        value: value,
        expires: moment().add(ttl, 'seconds')
    };
};

module.exports = NaiveCache;