var parseTemplate = require('uri-template').parse,
    client        = require('./hal-client'),
    moment        = require('moment');

function presentRepresentative(response) {
    var representative = response.find,
        party          = response.party,
        district       = response.district;

    return {
        fullName: representative.first_name + ' ' + representative.last_name,
        party: party,
        district: district,
        img: parseTemplate(representative._links.image.href).expand({version: 'medium'}),
        age: moment(representative.date_of_death || new Date()).diff(representative.date_of_birth, 'years')
    };
}

function presentParty(response) {
    var party = response.find;

    console.log(party);

    return {
        name: party.name,
        slug: party.slug,
        logo: parseTemplate(party._links.logo.href).expand({})
    };
}

module.exports = {
    representatives: {
        findBySlug: function(slug) {
            var request = client.follow('representatives').follow('find', {slug: slug});

            request.follow('party');
            request.follow('committees');
            request.follow('district');

            return request.get().then(presentRepresentative);
        },

        all: function () {
            // TODO: pagination? only fetch attending reps?
            return client.follow('representatives').get().then(function (response) {
                return response.representatives._embedded.representatives;
            });
        }
    },

    parties: {
        findBySlug: function (slug) {
            var request = client.follow('parties').follow('find', {slug: slug});
            return request.get().then(presentParty);
        }
    }
};


