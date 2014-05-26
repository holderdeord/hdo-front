var backend = require('../lib/hdo/backend'),
    assert  = require('assert'),
    Promise = require('bluebird');

Promise.onPossiblyUnhandledRejection(function (error) { throw error; });

// TODO: maybe look at https://www.npmjs.org/package/assert-promise ?

describe('Backend', function(){
    describe('representatives', function(){
        it('should find an existing representative', function(){
            backend.representatives.findBySlug('jes').then(function(rep) {
                assert.equal('string', typeof rep.fullName);
            });
        });

        it('should reject when the representative does not exist', function(){
            backend.representatives.findBySlug('no-such-representative').then(function() {
                assert(false, 'Expected promise to be rejected');
            }, function(error) {
                assert.equal('no such representative', error);
            });
        });
    });
});
