module.exports = function(req, res) {
    return res.render('index', {
        now: new Date()
    });
};
