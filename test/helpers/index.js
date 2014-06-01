var Promise = require('bluebird'),
    referee = require('referee');

referee.add('jsonEquals', {
    assert: function (actual, expected) {
        this.actualString = JSON.stringify(actual);
        this.expectedString = JSON.stringify(expected);

        return this.actualString == this.expectedString;
    },
    assertMessage: 'Expected ${actualString} to be equal to ${expectedString}',
    refuteMessage: 'Expected ${actualString} to not be equal to ${expectedString}'
});

Promise.onPossiblyUnhandledRejection(function (error) { throw error; });
// Promise.longStackTraces();

