var express = require('express');
var browserify = require('browserify-middleware');
var hbs = require('express-hbs');
var less = require('less-middleware');

var hdo = require('./lib/hdo');

var app = express();

// config
app.use(express.logger('short'));
app.engine('hbs', hbs.express3({
    layoutsDir: __dirname + '/views/_layouts',
    defaultLayout: __dirname + '/views/_layouts/default.hbs',
    partialsDir: __dirname + '/views/_partials',
    beautify: true
}));

app.set('port', Number(process.env.PORT || 9090));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

// middleware
app.use('/javascript', browserify('./client/javascript'));

app.use(
    less(__dirname + '/client', {
        dest: __dirname + '/public',
        debug: true
    }, {
        paths: [__dirname + '/client/bower_components/bootstrap/less']
    })
);

app.use(express.static(__dirname + '/public'));
app.use('/fonts', express.static(__dirname + '/client/bower_components/bootstrap/fonts'));

// routes
app.get('/', hdo.handlers.front);
app.get('/representanter/:slug', hdo.handlers.representative);


// launch
app.listen(app.get('port'), function() {
    console.log('hdo-front started on ' + app.get('port'));
});
