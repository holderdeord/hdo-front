var moment = require('moment');

moment.lang('nb');

module.exports = {
    presentIssue: function (issue) {
        return {
            title: issue.title,
            slug: issue.slug,
            description: issue.description,
            published: moment(issue.published_at).format('L'),
            updated: moment(issue.updated_at).format('L')
        };
    }
};