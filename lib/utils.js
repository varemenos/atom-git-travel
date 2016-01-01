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

var getCurrentBranch = function (repo) {
  return repo.getCurrentBranch()
    .then(function (result) {
      return result
        .name()
        .replace('refs/heads/', '');
    });
};

var refsToBranches = function (refs) {
  return refs
    .filter((ref) => {
      return ref.indexOf('refs/tags') !== 0 && ref.indexOf('refs/remotes/origin/') !== 0 && ref.indexOf('refs/stash') !== 0;
    });
};

var refsToTags = function (refs) {
  return refs
    .filter((tag) => {
      return tag.indexOf('refs/tags/') === 0;
    })
    .map((tag) => {
      return tag.replace('ref/tags/', '');
    });
};

var prepareBranches = function (repo, refs, currentBranch) {
  var branches = refsToBranches(refs);

  return Promise.all(
    branches.map((branch) => {
      return repo.getReferenceCommit(branch);
    })
  )
    .then((commits) => {
      return branches.map((branch, i) => {
        var branchName = branch.replace('refs/heads/', '');

        return {
          name: branchName,
          ref: commits[i],
          current: currentBranch === branchName
        };
      });
    });
};

var prepareTags = function (repo, refs) {
  var tags = refsToTags(refs);

  return Promise.all(
    tags.map(function (tag) {
      return repo.getTagByName(tag)
        .then((tagRef) => {
          return repo.getCommit(tagRef.targetId());
        });
    })
  )
    .then(function (commits) {
      return tags.map((tag, i) => {
        return {
          name: tag.replace('refs/tags/', ''),
          ref: commits[i]
        };
      });
    });
};

module.exports = {
  getRepo,
  getCurrentBranch,
  refsToBranches,
  refsToTags,
  prepareBranches,
  prepareTags
};
