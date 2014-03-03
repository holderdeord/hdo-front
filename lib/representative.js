var _ = require('lodash');

var data = {
    representative: [{
        fullName: 'Jens Stoltenberg',
        age: 54,
        slug: 'jes',
        district: 'Oslo',
        party: {
            name: 'Arbeiderpartiet',
            slug: 'a'
        },
        url: '/representant/jes',
        twitter: '@jensstoltenberg'
    }, {
        fullName: 'Erna Solberg',
        age: 53,
        slug: 'es',
        district: 'Hordaland',
        party: {
            name: 'Høyre',
            slug: 'h'
        },
        url: '/representant/es',
        img: 'http://www.holderdeord.no/uploads/representative/image/es/large_0f9a1dd5bd8e756474f5be27e44b35a4.jpg',
        twitter: '@Erna_Solberg'
    }]
};

var representatives = function(req, res) {
    res.render('representative/representatives', data);
};

var representative = function(req, res) {
    var p = _.find(data.representative, function(e) {
        return e.slug === req.params.slug;
    });

    res.render('representative/representative', p);
};

module.exports = {
	representative: representative,
    representatives: representatives
};
