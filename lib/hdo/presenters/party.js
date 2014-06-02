var parseTemplate           = require('uri-template').parse,
    merge                   = require('deepmerge'),
    representativePresenter = require('./representative');

module.exports.presentParty = function(party) {
    return {
        name: party.name,
        slug: party.slug,
        logo: parseTemplate(party.link('logo').href).expand({})
    };
};

module.exports.presentPartyWithRepresentatives = function (party, representatives) {
    return merge(this.presentParty(party), {
        representatives: representatives.map(representativePresenter.presentRepresentative)
    });
};
