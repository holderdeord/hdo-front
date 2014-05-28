var nconf = require('nconf');

nconf.argv()
    .env()
    .defaults({
        PORT: 9090,
        NODE_ENV: 'dev',
        api: 'http://www.holderdeord.no/api/'
    });

module.exports = nconf;
