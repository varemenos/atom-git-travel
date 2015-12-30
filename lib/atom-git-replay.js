'use strict';

var path = require('path');
var NodeGit = require('nodegit');

var AtomGitReplayView = require('./atom-git-replay-view');
var CompositeDisposable = require('atom').CompositeDisposable;

var AtomGitReplay = {};

AtomGitReplay.AtomGitReplayView = null;
AtomGitReplay.rightPanel = null;
AtomGitReplay.subscriptions = null;

AtomGitReplay.getCommits = function () {
  var _this = this;
  var repo;

  NodeGit.Repository.open(path.resolve('../toolbar-almighty/'))
    .then(function(r) {
      repo = r;

      return repo.getCurrentBranch();
    }).then(function (currentBranch) {
      return repo.getBranchCommit(currentBranch);
    }).then(function (firstCommitOnBranch) {
      var history = firstCommitOnBranch.history();
      var commits = [];

      history.on('commit', function (commit) {
        commits.push(commit);
      });

      history.on('error', function (e) {
        throw e;
      });

      history.on('end', function () {
        _this.AtomGitReplayView.updateElement(commits);
      });

      history.start();
    }).catch(function (e) {
      console.log(e);
    });
};

AtomGitReplay.activate = function(state) {
  this.AtomGitReplayView = new AtomGitReplayView(state.AtomGitReplayViewState);

  this.rightPanel = atom.workspace.addRightPanel({
    item: this.AtomGitReplayView.getElement(),
    visible: false
  });

  this.subscriptions = new CompositeDisposable;

  return this.subscriptions.add(atom.commands.add('atom-workspace', {
    'atom-git-replay:toggle': (function(_this) {
      return function () {
        return _this.toggle();
      };
    })(this)
  }));
};

AtomGitReplay.deactivate = function() {
  this.rightPanel.destroy();
  this.subscriptions.dispose();
  return this.AtomGitReplayView.destroy();
};

AtomGitReplay.serialize = function() {
  return {
    AtomGitReplayViewState: this.AtomGitReplayView.serialize()
  };
};

AtomGitReplay.toggle = function() {
  if (!this.rightPanel.isVisible()) {
    AtomGitReplay.getCommits();
  }

  return this.rightPanel.isVisible() ?
    this.rightPanel.hide() :
    this.rightPanel.show();
};

module.exports = AtomGitReplay;
