var _ = require('lodash');

var data = {
    parties: [{
        name: 'Arbeiderpartiet',
        slug: 'a',
        url: '/organisasjoner/partier/a'
    }, {
        name: 'Høyre',
        slug: 'h',
        url: '/organisasjoner/partier/h'
    }]
};

var index = function(req, res) {
    res.render('index', {
        now: new Date()
    });
};

var parties = function(req, res) {
    res.render('organizations/parties', data);
};

var party = function(req, res) {
    var p = _.find(data.parties, function(e) {
        return e.slug === req.params.slug;
    });

    res.render('organizations/party', p);
};

module.exports = {
    front: {
        index: index,
        organizations: {
            parties: parties,
            party: party
        }
    }
};
