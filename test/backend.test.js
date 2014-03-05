var backend = require('../lib/hdo/backend');
var assert = require('assert');
var Promise = require('bluebird');

Promise.onPossiblyUnhandledRejection(function (error) {
    throw error;
});

// TODO: maybe look at https://www.npmjs.org/package/assert-promise ?

describe('Backend', function(){
    describe('representative', function(){
        it('should reject when the value is not found', function(){
            backend.representatives.getBySlug('no').then(function() {
                assert(false, 'Expected promise to be rejected');
            }, function(error) {
                assert.equal('no such representative', error);
            });
        });
    });
});

describe('Backend', function(){
    describe('representative', function(){
        it('should fulfill when the value is found', function(){
            backend.representatives.getBySlug('jes').then(function(rep) {
                assert.equal('Jens Stoltenberg', rep.fullName);
            });
        });
    });
});
