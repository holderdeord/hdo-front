var config                  = require('../../config'),
    client                  = require('../hal/client')(config.get('api')),
    partyPresenter          = require('./presenters/party'),
    issuePresenter          = require('./presenters/issue'),
    representativePresenter = require('./presenters/representative');

module.exports.representatives = {
    findBySlug: function(slug) {
        var request        = client.builder(),
            representative = request.follow('representatives').follow('find', {slug: slug});

        representative.follow('party');
        representative.follow('committees');
        representative.follow('district');

        return request.get().then(function (response) {
            var rep = response.embedded('representatives').embedded('find');
            return representativePresenter.presentFullRepresentative(rep,
                                             rep.embedded('party'),
                                             rep.embedded('district'),
                                             rep.embeddedArray('committees'));
        });
    }
};

module.exports.parties = {
    all: function() {
        var request = client.builder();
        request.follow('parties');

        return request.get().then(function (response) {
            return response.embedded('parties').embeddedArray('parties').map(partyPresenter.presentParty);
        });
    },

    findBySlug: function(slug) {
        var request = client.builder(),
            party  = request.follow('parties').follow('find', {slug: slug});

        party.follow('attending_representatives');

        return request.get().then(function (response) {
            var p    = response.embedded('parties').embedded('find'),
                reps = p.embedded('attending_representatives').embeddedArray('representatives');

            return partyPresenter.presentPartyWithRepresentatives(p, reps);
        });
    }
};

module.exports.issues = {
    all: function() {
        var request = client.builder();
        request.follow('issues');

        return request.get().then(function (response) {
            return response.embedded('issues').embeddedArray('issues').map(issuePresenter.presentIssue);
        });
    },

    findBySlug: function (slug) {
        var id      = /^(\d+)/.exec(slug)[1],
            request = client.builder();

        request.follow('issues').follow('find', {id: id});

        return request.get().then(function (response) {
            return issuePresenter.presentIssue(response.embedded('issues').embedded('find'));
        });
    }
};






