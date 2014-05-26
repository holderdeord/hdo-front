var backend = require('./hdo/backend');

var index = function(req, res) {
    res.render('index', { now: new Date() });
};

var representative = function (req, res) {
    backend.representatives.findBySlug(req.params.slug).then(function(rep) {
        res.render('representative', rep);
    }).catch(function(err) {
        console.log(err.stack);
        res.send(err.httpStatus || 500);
    });
};

module.exports = {
    handlers: {
        front: index,
        representative: representative
    }
};
