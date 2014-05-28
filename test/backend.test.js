var backend     = require('../lib/hdo/backend'),
    assert      = require('assert');

describe('Backend', function(){
    describe('representatives', function(){
        it('should find an existing representative', function(){
            return backend.representatives.findBySlug('jes').then(function(rep) {
                assert.equal('string', typeof rep.fullName);
            });
        });

        it('should reject when the representative does not exist', function(){
            return backend.representatives.findBySlug('no-such-representative').then(function() {
                assert(false, 'Expected promise to be rejected');
            }, function(error) {
                assert.equal('no such representative', error);
            });
        });
    });
});
