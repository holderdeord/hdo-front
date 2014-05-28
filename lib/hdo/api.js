var parseTemplate = require('uri-template').parse,
    client        = require('../hal/client')('http://www.holderdeord.no/api/'),
    // client        = require('../hal/client')('http://localhost:3000/api/'),
    moment        = require('moment');

module.exports = {
    representatives: {
        findBySlug: function(slug) {
            var request = client.builder(),
                representative = request.follow('representatives').follow('find', {slug: slug});

            representative.follow('party');
            representative.follow('committees');
            representative.follow('district');

            return request.get().then(presentRepresentative);
        },

        all: function () {
            // TODO: pagination? only fetch attending reps?

            var request = client.builder();
            request.follow('representatives');

            return request.get().then(prepareRepresentativeList);
        }
    },

    parties: {
        findBySlug: function (slug) {
            var request = client.builder();
            request.follow('parties').follow('find', {slug: slug});

            return request.get().then(presentParty);
        }
    }
};

// presenters
// // TODO: get rid of HAL awareness

function presentRepresentative(response) {
    var representative = response.representatives[0].find[0],
        party          = representative.party[0],
        district       = representative.district[0],
        committees     = representative.committees;

        console.log(committees)

    return {
        fullName: [representative.first_name, representative.last_name].join(' '),
        party: party,
        partyLogo: parseTemplate(party._links.logo.href).expand({}),
        district: district,
        img: parseTemplate(representative._links.image.href).expand({version: 'medium'}),
        age: moment(representative.date_of_death || new Date()).diff(representative.date_of_birth, 'years'),
        committees: committees,
        twitter: representative.twitter,
        twitter_url: representative.twitter && representative._links.twitter.href,
        attending: representative.attending
    };
}

function presentParty(response) {
    var party = response.parties[0].find[0];

    return {
        name: party.name,
        slug: party.slug,
        logo: parseTemplate(party._links.logo.href).expand({})
    };
}

function prepareRepresentativeList(response) {
    return response.representatives[0]._embedded.representatives;
}

