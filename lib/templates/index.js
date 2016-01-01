'use strict';

module.exports = {
  item: require('./item'),
  panels: {
    branches: require('./panels/branches'),
    tags: require('./panels/tags'),
    commits: require('./panels/commits')
  }
};
