var Promise = require('bluebird');

var representatives = {
    jes: {
        fullName: 'Jens Stoltenberg',
        age: 54,
        slug: 'jes',
        district: 'Oslo',
        party: {
            name: 'Arbeiderpartiet',
            slug: 'a'
        },
        propositions: [
            {text: 'For å vedta endringer i statsbudsjettet 2013'},
            {text: 'For å godkjenne avtale med EØS'},
            {text: 'Mot å utrede finansiell og klimapolitisk risiko i oljefondet'}
        ],
        url: '/representant/jes',
        img: 'http://www.holderdeord.no/uploads/representative/image/jes/large_9ea280400cc45d279c87c361b9d61dff.jpg',
        twitter: '@jensstoltenberg'
    },
    es: {
        fullName: 'Erna Solberg',
        age: 53,
        slug: 'es',
        district: 'Hordaland',
        party: {
            name: 'Høyre',
            slug: 'h'
        },
        propositions: [
            {text: 'For å vedta endringer i statsbudsjettet 2013'},
            {text: 'For å godkjenne avtale med EØS'},
            {text: 'Mot å utrede finansiell og klimapolitisk risiko i oljefondet'}
        ],
        url: '/representant/es',
        img: 'http://www.holderdeord.no/uploads/representative/image/es/large_0f9a1dd5bd8e756474f5be27e44b35a4.jpg',
        twitter: '@Erna_Solberg'
    }
};


module.exports = {
    representatives: {
        getBySlug: function (slug) {
            return new Promise(function(resolve, reject) {
                if (representatives[slug]) {
                    resolve(representatives[slug]);
                } else {
                    reject('no such representative');
                }
            });
        }
    }
};
