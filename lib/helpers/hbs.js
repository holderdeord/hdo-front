var eachGroupOf = function (size, collection, options) {
    var cur = [],
        ret = '';

    collection.forEach(function (e, i) {
        if (i > 0 && i % size === 0) {
            ret += options.fn(cur);
            cur = [];
        }

        cur.push(e);
    });

    if (cur.length > 0) {
        ret += options.fn(cur);
    }

    return ret;
};


module.exports.addTo = function (hbs) {
    hbs.registerHelper('eachGroupOf', eachGroupOf);
    hbs.registerHelper('jsonify', JSON.stringify);
};