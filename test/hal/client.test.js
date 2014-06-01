var
    client  = require('../../lib/hal/client'),
    assert  = require('assert'),
    nock    = require('nock'),
    merge   = require('deepmerge');

describe('HalClient', function() {
    var rootResponse     = { _links: {'ea:orders': {href: 'http://api.io/orders'}}},
        ordersResponse   = { _links: {'ea:find': {href: 'http://api.io/orders/{id}', templated: true}}},
        customerResponse = { name: 'foo' },
        basketResponse   = { name: 'bar'},
        embeddedBasket   = { name: 'baz' },
        findResponse     = { _links: { 'ea:customer': { href: 'http://api.io/customer/42'},
                                       'ea:basket': {href: 'http://api.io/basket/123'}}},

        findResponseWithEmbeddedCustomer = {
            _links: { 'ea:customer': { href: 'http://api.io/customer/42'} },
            _embedded: { 'ea:basket': embeddedBasket }
        },

        basicRequestSpec = [
          {
            rel: 'ea:orders',
            follow: [
              {
                rel: 'ea:find',
                params: {id: 13},
                follow: [
                    {rel: 'ea:basket', follow: []},
                    {rel: 'ea:customer', follow: []}
                ]
              }
            ]
          }
        ];

    beforeEach(function () {
        nock('http://api.io').get('/').reply(200, rootResponse)
                            .get('/orders').reply(200, ordersResponse)
                            .get('/orders/13').reply(200, findResponse)
                            .get('/orders/14').reply(200, findResponseWithEmbeddedCustomer)
                            .get('/customer/42').reply(200, customerResponse)
                            .get('/basket/123').reply(200, basketResponse);
    });

    it('fetches relations according to request specification', function () {
        var api = client('http://api.io/');

        var expected = {
            'ea:orders': [merge(ordersResponse, {
                'ea:find': [
                    merge(findResponse, {
                        'ea:basket': [basketResponse],
                        'ea:customer': [customerResponse]
                    })
                ]
            })],
        };

        return api.request(basicRequestSpec).then(function(actual) {
            assert.equal(JSON.stringify(expected, null, '  '), JSON.stringify(actual, null, '  '));
        });
    });

    it('builds a request spec', function () {
        var api   = client('http://api.io/'),
            builder = api.builder(),
            order = builder.follow('ea:orders').follow('ea:find', {id: 13});

        order.follow('ea:basket');
        order.follow('ea:customer');

        var expected = basicRequestSpec,
            actual   = builder.specs;

        assert.equal(JSON.stringify(expected, null, '  '), JSON.stringify(actual, null, '  '));
    });

    it('uses embedded resources if present', function () {
        var api = client('http://api.io'),
            spec = [merge(basicRequestSpec[0], {follow: [{params: {id: 14}}]})];

        return api.request(spec).then(function (res) {
            var order = res['ea:orders'][0]['ea:find'][0];
            assert.equal(JSON.stringify(order['ea:basket'][0], null, '  '), JSON.stringify(embeddedBasket, null, '  '));
        });


    });
});


