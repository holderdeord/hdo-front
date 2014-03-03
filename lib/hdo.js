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

var about = function(req, res) {
    res.render('index', {
        now: new Date()
    });
};

var contact = function(req, res) {
    res.render('index', {
        now: new Date()
    });
};

var people = function(req, res) {
    res.render('index', {
        now: new Date()
    });
};

var faq = function(req, res) {
    res.render('index', {
        now: new Date()
    });
};

var approach = function(req, res) {
    res.render('index', {
        now: new Date()
    });
};

var friends = function(req, res) {
    res.render('index', {
        now: new Date()
    });
};

var terms = function(req, res) {
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
        about: {
            about: about,
            contact: contact,
            people: people,
            faq: faq,
            approach: approach,
            friends: friends,
            terms: terms
        },
        organizations: {
            parties: parties,
            party: party
        }
    }
};
