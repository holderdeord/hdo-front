var backend = require('../lib/hdo/backend');
var assert = require('assert');
var Promise = require('bluebird');

Promise.onPossiblyUnhandledRejection(function (error) {
    throw error;
});

// TODO: maybe look at https://www.npmjs.org/package/assert-promise ?

describe('Backend', function(){
    describe('representatives', function(){
        it('should find an existing representative', function(){
            backend.representatives.getBySlug('jes').then(function(rep) {
                assert.equal('string', typeof rep.fullName);
            });
        });
        
        it('should reject when the representative does not exist', function(){
            backend.representatives.getBySlug('no-such-representative').then(function() {
                assert(false, 'Expected promise to be rejected');
            }, function(error) {
                assert.equal('no such representative', error);
            });
        });
    });
});
