var nconf = require('nconf');

nconf.argv()
    .env()
    .defaults({
        PORT: 9090,
        NODE_ENV: 'dev',
        api: 'https://www.holderdeord.no/api/',
        cache: 'enabled'
    });

module.exports = nconf;

