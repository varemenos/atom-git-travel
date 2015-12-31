'use strict';

var NodeGit = require('nodegit');

var getRepo = function () {
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

module.exports = {
  getRepo
};
