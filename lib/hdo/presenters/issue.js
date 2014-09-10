var moment = require('moment'),
    _ = require('lodash');


moment.lang('nb');

module.exports = {
    presentIssue: function (issue) {
        return {
            title: issue.title,
            slug: issue.slug,
            description: issue.description,
            published: moment(issue.published_at).format('L'),
            updated: moment(issue.updated_at).format('L'),
            href: '/saker/' + issue.slug
        };
    },

    presentIssueWithPromises: function (issue, promises) {
        var result          = this.presentIssue(issue),
            sortedPromises  = _.sortBy(promises, ['promisor_name', 'parliament_period_name']),
            groupedPromises = _.groupBy(sortedPromises, 'promisor_name');

        result.groupedPromises = groupedPromises;

        return result;
    }
};