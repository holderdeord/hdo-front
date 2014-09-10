
var express    = require('express'),
    browserify = require('browserify-middleware'),
    hbs        = require('express-hbs'),
    hbsHelpers = require('./lib/helpers/hbs'),
    sass       = require('node-sass'),
    hdo        = require('./lib/hdo'),
    logger     = require('morgan'),
    app        = express(),
    bowerDir   = __dirname + '/client/bower_components',
    config     = require('./config');

// config
app.use(logger('short'));
app.engine('hbs', hbs.express3({
    layoutsDir: __dirname + '/views/_layouts',
    defaultLayout: __dirname + '/views/_layouts/default.hbs',
    partialsDir: __dirname + '/views/_partials'
}));
hbsHelpers.addTo(hbs);

app.set('port', config.get('PORT'));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.disable('x-powered-by');

// middleware
app.use('/javascript', browserify('./client/javascript'));

app.use(sass.middleware({
    src: __dirname + '/client',
    dest: __dirname + '/public',
    debug: true,
    outputStyle: 'compressed',
    includePaths: [bowerDir + '/twbs-bootstrap-sass/vendor/assets/stylesheets/bootstrap']
}));

if(app.get('env') === 'development') {
    app.use(require('errorhandler')());
}
app.use(express.static(__dirname + '/public'));
app.use('/fonts', express.static(bowerDir + '/twbs-bootstrap-sass/vendor/assets/fonts'));

// routes
app.get('/', hdo.handlers.front);
app.get('/representanter/:slug', hdo.handlers.representative);
app.get('/partier/:slug', hdo.handlers.party);
app.get('/saker/:slug', hdo.handlers.issue);
app.get('/saker', hdo.handlers.issues);
app.get('/robots.txt', hdo.handlers.robots);

// launch
app.listen(app.get('port'), function() {
    console.log('hdo-front started on ' + app.get('port'));
});
