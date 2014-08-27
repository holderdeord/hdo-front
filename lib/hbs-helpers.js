var eachGroupOf = function (size, collection, options) {
    var cur = [];
    
    collection.forEach(function (e, i) {
        if (i > 0 && i % size === 0) {
            options.fn(cur);
            cur = [];
        }

        cur.push(e);
    });

    if (cur.length > 0) {
        options.fn(cur);
    }
};


module.exports.addTo = function (hbs) {
    hbs.registerHelper('eachGroupOf', eachGroupOf);
};