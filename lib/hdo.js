// var backend = require('./hdo/backend');
var backend = require('./hdo/api');

function errorHandler(err) {
    console.log(err.stack);
    this.status(err.httpStatus || 500).send(err.toString());
}

function index(req, res) {
    backend.representatives.all().then(function (reps) {
        console.log(reps);

        res.render('index', {
            now: new Date(),
            representatives: reps,
        });
    });
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

module.exports = {
    handlers: {
        front: index,
        representative: representative,
        party: party
    }
};
