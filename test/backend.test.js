var backend = require('../lib/hdo/backend');
var assert = require('assert');

describe('Backend', function(){
    describe('representative', function(){
        it('should reject when the value is not found', function(){
            assert.equal(true, backend.representatives.getBySlug('no').isRejected());
        });
    });
});

describe('Backend', function(){
    describe('representative', function(){
        it('should fulfill when the value is found', function(){
            assert.equal(true, backend.representatives.getBySlug('jes').isFulfilled());
        });
    });
});
