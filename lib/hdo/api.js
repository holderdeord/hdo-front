var config        = require('../../config'),
    parseTemplate = require('uri-template').parse,
    client        = require('../hal/client')(config.get('api')),
    moment        = require('moment'),
    merge         = require('deepmerge');

module.exports = {
    representatives: {
        findBySlug: function(slug) {
            var request        = client.builder(),
                representative = request.follow('representatives').follow('find', {slug: slug});

            representative.follow('party');
            representative.follow('committees');
            representative.follow('district');

            return request.get().then(function (response) {
                var rep = response.representatives[0].find[0]
                return presentFullRepresentative(rep, rep.party[0], rep.district[0], rep.committees);
            });
        }
    },

    parties: {
        all: function() {
            var request = client.builder();
            request.follow('parties');

            return request.get().then(function (response) {
                return response.parties[0]._embedded.parties.map(presentParty);
            });
        },

        findBySlug: function(slug) {
            var request = client.builder(),
                 party  = request.follow('parties').follow('find', {slug: slug});

            party.follow('attending_representatives');

            return request.get().then(function (response) {
                var p    = response.parties[0].find[0],
                    reps = p.attending_representatives[0]._embedded.representatives;

                return presentPartyWithRepresentatives(p, reps);
            });
        }
    },

    issues: {
        all: function() {
            var request = client.builder();
            request.follow('issues')

            return request.get().then(function (response) {
                return response.issues[0]._embedded.issues.map(presentIssue)
            });
        },

        findBySlug: function (slug) {
            var id = /^(\d+)/.exec(slug)[1];

            var request = client.builder(),
                issue   = request.follow('issues').follow('find', {id: id});;

            return request.get().then(function (response) {
                return presentIssue(response.issues[0].find[0]);
            })
        }
    }
};

// presenters

function presentFullRepresentative(representative, party, district, committees) {
    return merge(presentRepresentative(representative), {
        party: presentParty(party),
        district: district,
        committees: committees,
    });
}

function presentRepresentative(r) {
    return {
        name: [r.first_name, r.last_name].join(' '),
        slug: r.slug,
        image: parseTemplate(r._links.image.href).expand({version: 'medium'}),
        age: moment(r.date_of_death || new Date()).diff(r.date_of_birth, 'years'),
        twitter: r.twitter,
        twitter_url: r.twitter && r._links.twitter.href,
        attending: r.attending,
    };
}

function presentParty(party) {
    return {
        name: party.name,
        slug: party.slug,
        logo: parseTemplate(party._links.logo.href).expand({})
    };
}

function presentPartyWithRepresentatives(party, representatives) {
    return merge(presentParty(party), {representatives: representatives.map(presentRepresentative)});
}

function presentIssue(issue) {
    return {
        title: issue.title,
        slug: issue.slug
    }
}
