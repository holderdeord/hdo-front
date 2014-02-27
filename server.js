var express = require('express');
var browserify = require('browserify-middleware');
var hbs = require('express-hbs');
var sass = require('node-sass');
var hdo = require('./lib/hdo');

var app = express();

// config

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

app.use(sass.middleware({
    src: __dirname + '/client',
    dest: __dirname + '/public',
    debug: true,
}));

app.use(express.static(__dirname + '/public'));

// routes
app.get('/', hdo.front.index);
app.get('/organisasjoner/partier', hdo.front.organizations.parties);
app.get('/organisasjoner/partier/:slug', hdo.front.organizations.party);


// launch

app.listen(app.get('port'), function() {
    console.log('hdo-front started on ' + app.get('port'));
});
