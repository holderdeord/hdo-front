var config        = require('../../config'),
    parseTemplate = require('uri-template').parse,
    client        = require('../hal/client')(config.get('api')),
    moment        = require('moment'),
    merge         = require('deepmerge');

moment.lang('nb');

module.exports = {
    representatives: {
        findBySlug: function(slug) {
            var request        = client.builder(),
                representative = request.follow('representatives').follow('find', {slug: slug});

            representative.follow('party');
            representative.follow('committees');
            representative.follow('district');

            return request.get().then(function (response) {
                var rep = response.embedded('representatives').embedded('find');
                return presentFullRepresentative(rep,
                                                 rep.embedded('party'),
                                                 rep.embedded('district'),
                                                 rep.embeddedArray('committees'));
            });
        }
    },

    parties: {
        all: function() {
            var request = client.builder();
            request.follow('parties');

            return request.get().then(function (response) {
                return response.embedded('parties').embeddedArray('parties').map(presentParty);
            });
        },

        findBySlug: function(slug) {
            var request = client.builder(),
                party  = request.follow('parties').follow('find', {slug: slug});

            party.follow('attending_representatives');

            return request.get().then(function (response) {
                var p    = response.embedded('parties').embedded('find'),
                    reps = p.embedded('attending_representatives').embeddedArray('representatives');

                return presentPartyWithRepresentatives(p, reps);
            });
        }
    },

    issues: {
        all: function() {
            var request = client.builder();
            request.follow('issues');

            return request.get().then(function (response) {
                return response.embedded('issues').embeddedArray('issues').map(presentIssue);
            });
        },

        findBySlug: function (slug) {
            var id      = /^(\d+)/.exec(slug)[1],
                request = client.builder();

            request.follow('issues').follow('find', {id: id});

            return request.get().then(function (response) {
                return presentIssue(response.embedded('issues').embedded('find'));
            });
        }
    }
};

// presenters

function presentFullRepresentative(representative, party, district, committees) {
    return merge(presentRepresentative(representative), {
        party: presentParty(party),
        district: district,
        committees: committees
    });
}

function presentRepresentative(r) {
    return {
        name: [r.first_name, r.last_name].join(' '),
        slug: r.slug,
        image: parseTemplate(r.link('image').href).expand({version: 'medium'}),
        age: moment(r.date_of_death || new Date()).diff(r.date_of_birth, 'years'),
        twitter: r.twitter,
        twitter_url: r.twitter && r.link('twitter').href,
        attending: r.attending
    };
}

function presentParty(party) {
    return {
        name: party.name,
        slug: party.slug,
        logo: parseTemplate(party.link('logo').href).expand({})
    };
}

function presentPartyWithRepresentatives(party, representatives) {
    return merge(presentParty(party), {
        representatives: representatives.map(presentRepresentative)
    });
}

function presentIssue(issue) {
    return {
        title: issue.title,
        slug: issue.slug,
        description: issue.description,
        published: moment(issue.published_at).format('L'),
        updated: moment(issue.updated_at).format('L')
    };
}
