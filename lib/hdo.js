var backend = require('./hdo/api'),
    Promise = require('bluebird');

function errorHandler(err) {
    console.log(err.stack);
    this.status(err.httpStatus || 500).send(err.toString());
}

function index(req, res) {
    Promise.join(backend.parties.all(), backend.issues.all()).spread(function (parties, issues) {
        res.render('index', { parties: parties, issues: issues });
    }).catch(errorHandler.bind(res));
}

function representative(req, res) {
    backend.representatives.findBySlug(req.params.slug).then(function(rep) {
        res.render('representative', rep);
    }).catch(errorHandler.bind(res));
}

function party(req, res) {
    backend.parties.findBySlug(req.params.slug).then(function(party) {
        res.render('party', party);
    }).catch(errorHandler.bind(res));
}

function issue(req, res) {
    backend.issues.findBySlug(req.params.slug).then(function (issue) {
        res.render('issue', issue);
    }).catch(errorHandler.bind(res));
}

function robots(req, res) {
    res.end('User-Agent: *\nDisallow: /\n');
}

module.exports = {
    handlers: {
        front: index,
        robots: robots,
        representative: representative,
        party: party,
        issue: issue
    }
};
