'use strict';

var path = require('path');
var NodeGit = require('nodegit');

var utils = require('./utils');
var AtomGitReplayView = require('./atom-git-replay-view');
var CompositeDisposable = require('atom').CompositeDisposable;

var AtomGitReplay = {};

AtomGitReplay.AtomGitReplayView = null;
AtomGitReplay.rightPanel = null;
AtomGitReplay.subscriptions = null;

AtomGitReplay.getReferences = function () {
  var self = this;

  utils.getRepo()
    .then(function (repo) {
      Promise.all([
        utils.getCurrentBranch(repo),
        repo.getReferenceNames(NodeGit.Reference.TYPE.OID)
      ])
        .then(function (data) {
          var currentBranch = data[0];
          var refs = data[1];

          var branches = utils.refsToBranches(refs);
          var tags = utils.refsToTags(refs);

          Promise.all(
            branches.map((branch) => {
              return repo.getReferenceCommit(branch);
            })
          )
            .then(function (commits) {
              var result = branches.map((branch, i) => {
                var branchName = branch.replace('refs/heads/', '');

                return {
                  name: branch.replace('refs/heads/', ''),
                  ref: commits[i],
                  current: currentBranch === branchName
                };
              });

              self.view.updateElement('branch', result);
            })
            .catch(function (e) {
              console.error(e);
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

              self.view.updateElement('tag', result);
            })
            .catch(function (e) {
              console.error(e);
            });
        })
        .catch(function (e) {
          console.error(e);
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
        console.error(e);
      });

      history.on('end', function () {
        self.view.updateElement('commit', commits);
      });

      history.start();
    }).catch(function (e) {
      console.error(e);
    });
};

AtomGitReplay.activate = function (state) {
  var self = this;

  this.view = new AtomGitReplayView(state.AtomGitReplayViewState);

  this.rightPanel = atom.workspace.addRightPanel({
    item: this.view.getElement(),
    visible: false
  });

  this.getCommits();
  this.getReferences();

  this.subscriptions = new CompositeDisposable; //eslint-disable-line

  this.subscriptions.add(
    atom.commands.add('atom-workspace', {
      'atom-git-replay:toggle': function () {
        self.toggle();
      }
    })
  );
};

AtomGitReplay.deactivate = function () {
  this.rightPanel.destroy();
  this.subscriptions.dispose();
  this.view.destroy();
};

AtomGitReplay.serialize = function () {
  return {
    AtomGitReplayViewState: this.view.serialize()
  };
};

AtomGitReplay.toggle = function () {
  if (this.rightPanel.isVisible()) {
    this.rightPanel.hide();
  } else {
    this.rightPanel.show();
  }
};

module.exports = AtomGitReplay;
