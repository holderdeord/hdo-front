var client  = require('../../lib/hal/client'),
    assert  = require('referee').assert,
    nock    = require('nock'),
    merge   = require('deepmerge');

describe('HalClient', function() {
    var rootResponse = {
        _links: {
            'ea:orders': {href: 'http://api.io/orders'},
            'ea:customers': {href: 'http://api.io/customers'}
        }
    },

        customerResponse = { name: 'foo'},
        basketResponse   = { name: 'bar'},
        embeddedBasket   = { name: 'baz' },

        ordersResponse    = { _links: {'ea:find': {href: 'http://api.io/orders/{id}', templated: true}}},

        customersResponse = {
            _links: {
                'ea:next': {href: 'http://api.io/customers?page=2'}
            },
            _embedded: {
                'ea:customers': [
                    merge(customerResponse, {id: 1}),
                    merge(customerResponse, {id: 2}),
                    merge(customerResponse, {id: 3})
                ]
            }
        },

        nextCustomersResponse = {
            _embedded: {
                'ea:customers': [
                    merge(customerResponse, {id: 4}),
                    merge(customerResponse, {id: 5}),
                    merge(customerResponse, {id: 6})
                ]
            }
        },

        findResponse      = { _links: { 'ea:customer': { href: 'http://api.io/customer/1'},
                                       'ea:basket': {href: 'http://api.io/basket/123'}}},

        findResponseWithEmbeddedCustomer = {
            _links: { 'ea:customer': { href: 'http://api.io/customer/1'} },
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
        nock('http://api.io')
            .get('/').reply(200, rootResponse)
            .get('/orders').reply(200, ordersResponse)
            .get('/orders/13').reply(200, findResponse)
            .get('/orders/14').reply(200, findResponseWithEmbeddedCustomer)
            .get('/customers').reply(200, customersResponse)
            .get('/customers?page=2').reply(200, nextCustomersResponse)
            .get('/customer/1').reply(200, customerResponse)
            .get('/basket/123').reply(200, basketResponse);
    });

    it('fetches relations according to request specification', function () {
        var api = client('http://api.io/');

        var expected = {
            _embedded: {
                'ea:orders': [merge(ordersResponse, {
                    _embedded: {
                        'ea:find': [
                            merge(findResponse, {
                                _embedded: {
                                    'ea:basket': [basketResponse],
                                    'ea:customer': [customerResponse]
                                }
                            })
                        ]
                    }
                })]
            }
        };

        return api.request(basicRequestSpec).then(function(actual) {
            assert.jsonEquals(actual.original(), expected);
        });
    });


    it('uses embedded resources if present', function () {
        var api  = client('http://api.io'),
            spec = [merge(basicRequestSpec[0], {follow: [{params: {id: 14}}]})];

        return api.request(spec).then(function (res) {
            var order  = res.embedded('ea:orders').embedded('ea:find'),
                basket = order.embedded('ea:basket');

            assert.jsonEquals(basket.original(), embeddedBasket);
        });
    });

    it('can follow pagination', function () {
        var api = client('http://api.io', {next: 'ea:next'});

        var spec = [
            {
                rel: 'ea:customers',
                paginate: true
            }
        ];

        return api.request(spec).then(function (res) {
            var customerCount = res.embedded('ea:customers').embeddedArray('ea:customers').length;
            assert.equals(customerCount, 6);
        });
    });

    it('builds a request spec', function () {
        var api     = client('http://api.io/'),
            builder = api.builder(),
            order   = builder.follow('ea:orders').follow('ea:find', {id: 13});

        order.follow('ea:basket');
        order.follow('ea:customer');

        var expected = basicRequestSpec,
            actual   = builder.specs;

        assert.jsonEquals(actual, expected);
    });

    it('builds a request spec with pagination', function () {
        var api = client('http://api.io/'),
            builder = api.builder();

        builder.follow('ea:orders', null, {paginate: true});

        assert.match(builder.specs, [
            {
                rel: 'ea:orders',
                paginate: true
            }
        ]);
    });
});


