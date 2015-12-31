'use strict';

var NodeGit = require('nodegit');

var Utils = {};

Utils.getRepo = function () {
  var repoPath = path.resolve(atom.project.getPaths()[0]);

  return new Promise(function (resolve) {
    return NodeGit.Repository.open(repoPath)
      .then(function (repo) {
        resolve(repo);
      })
      .catch(function (e) {
        reject(e);
      });
  });
};

Utils.getCurrentBranch = function (repo) {
  return repo.getCurrentBranch()
    .then(function (result) {
      return result
        .name()
        .replace('refs/heads/', '');
    });
};

Utils.refsToBranches = function (refs) {
  return refs
    .filter((ref) => {
      return ref.indexOf('refs/tags') !== 0 && ref.indexOf('refs/remotes/origin/') !== 0 && ref.indexOf('refs/stash') !== 0;
    });
};

Utils.refsToTags = function (refs) {
  return refs
    .filter((tag) => {
      return tag.indexOf('refs/tags/') === 0;
    })
    .map((tag) => {
      return tag.replace('ref/tags/', '');
    });
};

module.exports = Utils;
