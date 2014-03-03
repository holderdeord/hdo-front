module.exports = function (app) {
    var hdo = require('./lib/hdo');

    app.get('/', hdo.front.index);

    app.get('/organisasjoner/partier', hdo.front.organizations.parties);
    app.get('/organisasjoner/partier/:slug', hdo.front.organizations.party);

    // About
    app.get('/omoss', hdo.front.about.about);
    app.get('/kontakt', hdo.front.about.contact);
    app.get('/mennesker', hdo.front.about.people);
    app.get('/oss', hdo.front.about.faq);
    app.get('/metode', hdo.front.about.approach);
    app.get('/venner', hdo.front.about.friends);
    app.get('/vilkår', hdo.front.about.terms);
    app.get('/blogg',function(req, res) {
        req.method = 'get';
        res.redirect(302, 'http://blog.holderdeord.no');
    });
};
