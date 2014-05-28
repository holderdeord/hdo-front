var Promise = require('bluebird');

Promise.onPossiblyUnhandledRejection(function (error) { throw error; });
Promise.longStackTraces();
