'use strict';

var path = require('path');
var NodeGit = require('nodegit');

var AtomGitReplayView = require('./atom-git-replay-view');
var CompositeDisposable = require('atom').CompositeDisposable;

var AtomGitReplay = {};

AtomGitReplay.AtomGitReplayView = null;
AtomGitReplay.rightPanel = null;
AtomGitReplay.subscriptions = null;

AtomGitReplay.getRepo = function () {
  // var repoPath = path.resolve(atom.project.getPaths()[0]);
  var repoPath = path.resolve('../toolbar-almighty');

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

AtomGitReplay.getReferences = function () {
  var _this = this;

  return this.getRepo()
    .then(function (repo) {
      repo.getReferenceNames(NodeGit.Reference.TYPE.OID)
        .then(function (refs) {
          var branches = refs
            .filter((ref) => {
              return ref.indexOf('refs/tags') !== 0 && ref.indexOf('refs/remotes/origin/') !== 0 && ref.indexOf('refs/stash') !== 0;
            })
            .map((branch) => {
              return branch.replace('refs/heads/', '');
            });

          Promise.all(
            branches.map(function (branch) {
              return repo.getBranchCommit(branch);
            })
          )
            .then(function (commits) {
              _this.AtomGitReplayView.updateElement('branch', commits);
            });
        });
    });
};

AtomGitReplay.getCommits = function () {
  var _this = this;
  var repo;

  // var repoPath = path.resolve(atom.project.getPaths()[0]);
  var repoPath = path.resolve('../toolbar-almighty');

  this.getRepo()
    .then(function (r) {
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
        console.log(e);
        throw e;
      });

      history.on('end', function () {
        _this.AtomGitReplayView.updateElement('commit', commits);
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

  this.subscriptions = new CompositeDisposable;

  return this.subscriptions.add(atom.commands.add('atom-workspace', {
    'atom-git-replay:toggle': (function (_this) {
      return function () {
        return _this.toggle();
      };
    })(this)
  }));
};

AtomGitReplay.deactivate = function () {
  this.rightPanel.destroy();
  this.subscriptions.dispose();
  return this.AtomGitReplayView.destroy();
};

AtomGitReplay.serialize = function () {
  return {
    AtomGitReplayViewState: this.AtomGitReplayView.serialize()
  };
};

AtomGitReplay.toggle = function () {
  return this.rightPanel.isVisible() ?
    this.rightPanel.hide() :
    this.rightPanel.show();
};

module.exports = AtomGitReplay;
