'use strict';

var path = require('path');
var NodeGit = require('nodegit');

var AtomGitReplayView = require('./atom-git-replay-view');
var utils = require('./utils');
var CompositeDisposable = require('atom').CompositeDisposable;

var AtomGitReplay = {};

AtomGitReplay.AtomGitReplayView = null;
AtomGitReplay.rightPanel = null;
AtomGitReplay.subscriptions = null;

AtomGitReplay.getReferences = function () {
  var self = this;

  return utils.getRepo()
    .then(function (repo) {
      repo.getReferenceNames(NodeGit.Reference.TYPE.OID)
        .then(function (refs) {
          var branches = refs
            .filter((ref) => {
              return ref.indexOf('refs/tags') !== 0 && ref.indexOf('refs/remotes/origin/') !== 0 && ref.indexOf('refs/stash') !== 0;
            });

          var tags = refs
            .filter((tag) => {
              return tag.indexOf('refs/tags/') === 0;
            })
            .map((tag) => {
              return tag.replace('ref/tags/', '');
            });

          Promise.all(
            branches.map((branch) => {
              return repo.getReferenceCommit(branch);
            })
          )
            .then(function (commits) {
              var result = branches.map((branch, i) => {
                return {
                  name: branch.replace('refs/heads/', ''),
                  ref: commits[i]
                };
              });

              self.AtomGitReplayView.updateElement('branch', result);
            })
            .catch(function (e) {
              console.log(e);
            });

          Promise.all(
            tags.map(function (tag) {
              return repo.getTagByName(tag)
                .then((tagRef) => {
                  return repo.getCommit(tagRef.targetId());
                });
            })
          )
            .then(function (commits) {
              var result = tags.map((tag, i) => {
                return {
                  name: tag.replace('refs/tags/', ''),
                  ref: commits[i]
                };
              });

              self.AtomGitReplayView.updateElement('tag', result);
            })
            .catch(function (e) {
              console.log(e);
            });
        });
    });
};

AtomGitReplay.getCommits = function () {
  var self = this;
  var repo;

  utils.getRepo()
    .then(function (r) {
      repo = r;

      return repo.getCurrentBranch();
    }).then(function (currentBranch) {
      return repo.getBranchCommit(currentBranch);
    }).then(function (firstCommitOnBranch) {
      var history = firstCommitOnBranch.history();
      var commits = [];

      history.on('commit', function (commit) {
        commits.push({
          ref: commit
        });
      });

      history.on('error', function (e) {
        console.log(e);
        throw e;
      });

      history.on('end', function () {
        self.AtomGitReplayView.updateElement('commit', commits);
      });

      history.start();
    }).catch(function (e) {
      console.log(e);
    });
};

AtomGitReplay.activate = function (state) {
  this.AtomGitReplayView = new AtomGitReplayView(state.AtomGitReplayViewState);

  this.rightPanel = atom.workspace.addRightPanel({
    item: this.AtomGitReplayView.getElement(),
    visible: false
  });

  this.getCommits();
  this.getReferences();

  this.subscriptions = new CompositeDisposable; //eslint-disable-line

  return this.subscriptions.add(atom.commands.add('atom-workspace', {
    'atom-git-replay:toggle': (function (self) {
      return function () {
        return self.toggle();
      };
    })(this)
  }));
};

AtomGitReplay.deactivate = function () {
  this.rightPanel.destroy();
  this.subscriptions.dispose();
  this.AtomGitReplayView.destroy();
};

AtomGitReplay.serialize = function () {
  return {
    AtomGitReplayViewState: this.AtomGitReplayView.serialize()
  };
};

AtomGitReplay.toggle = function () {
  if (this.rightPanel.isVisible()) {
    return this.rightPanel.hide();
  } else {
    return this.rightPanel.show();
  }
};

module.exports = AtomGitReplay;
