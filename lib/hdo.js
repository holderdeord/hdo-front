var backend = require('./hdo/backend');

var index = function(req, res) {
    res.render('index', { now: new Date() });
};

var representative = function (req, res) {
    backend.representatives.getBySlug(req.params.slug).then(function(rep) {
        res.render('representative', rep);
    }).catch(function() {
        res.send(404);
    });
};

module.exports = {
    handlers: {
        front: index,
        representative: representative
    }
};
