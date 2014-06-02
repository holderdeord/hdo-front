var parseTemplate  = require('uri-template').parse,
    moment         = require('moment'),
    merge          = require('deepmerge'),
    partyPresenter = require('./party');

moment.lang('nb');

module.exports = {
    presentFullRepresentative: function (representative, party, district, committees) {
        return merge(this.presentRepresentative(representative), {
            party: partyPresenter.presentParty(party),
            district: district,
            committees: committees
        });
    },

    presentRepresentative: function (r) {
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
};
