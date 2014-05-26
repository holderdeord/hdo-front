var
    client   = require('../../lib/hdo/hal-client'),
    assert   = require('assert'),
    nock     = require('nock'),
    Promise = require('bluebird');

Promise.onPossiblyUnhandledRejection(function (error) { throw error; });

describe('HalClient', function() {
    beforeEach(function () {
        nock('http://api.io').get('/').reply(200, { _links: {'ea:orders': {href: 'http://api.io/orders'}} });
        nock('http://api.io').get('/orders').reply(200, { _links: {'ea:find': {href: 'http://api.io/orders/{id}', templated: true}} });
        nock('http://api.io').get('/orders/13').reply(200, {
            _links: {
                'ea:customer': {href: 'http://api.io/customer/42'},
                'ea:basket': {href: 'http://api.io/basket/123'}
            }
        });
    })

    it('fetches relations as specified', function () {
        return client('http://api.io/').follow('ea:orders').follow('ea:find', {id: 13}).get().then(function (res) {
            assert.deepEqual(['ea:orders', 'ea:find'], Object.keys(res));
        })
    });
});


