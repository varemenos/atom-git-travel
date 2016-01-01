'use strict';

var NodeGit = require('nodegit');

var utils = require('./utils');
var GitTravelView = require('./views/panel');
var CompositeDisposable = require('atom').CompositeDisposable;

var GitTravel = {};

GitTravel.GitTravelView = null;
GitTravel.rightPanel = null;
GitTravel.subscriptions = null;

GitTravel.getReferences = function () {
  var self = this;

  utils.getRepo()
    .then(function (repo) {
      Promise.all([
        utils.getCurrentBranch(repo),
        repo.getReferenceNames(NodeGit.Reference.TYPE.OID)
      ])
        .then((result)  => {
          var currentBranch = result[0];
          var refs = result[1];

          utils.prepareBranches(repo, refs, currentBranch)
            .then((branches) => {
              self.view.updateElement('branch', branches);
            })
            .catch((e) => console.error(e));

          utils.prepareTags(repo, refs)
            .then((tags) => {
              self.view.updateElement('tag', tags);
            })
            .catch((e) => console.error(e));
        })
        .catch((e) => console.error(e));
    });
};

GitTravel.getCommits = function () {
  var self = this;
  var repo;

  utils.getRepo()
    .then(function (r) {
      repo = r;

      return utils.getCurrentBranch(repo);
    }).then((currentBranch) => {
      return repo.getReferenceCommit(currentBranch);
    }).then((firstCommitOnBranch) => {
      var history = firstCommitOnBranch.history();
      var commits = [];

      history.on('commit', (commit) => {
        commits.push({
          ref: commit
        });
      });

      history.on('error', (e) => console.error(e));

      history.on('end', () => {
        self.view.updateElement('commit', commits);
      });

      history.start();
    }).catch((e) => console.error(e));
};

GitTravel.activate = function (state) {
  var self = this;

  this.view = new GitTravelView(state.GitTravelViewState);

  this.rightPanel = atom.workspace.addRightPanel({
    item: this.view.getElement(),
    visible: false
  });

  this.subscriptions = new CompositeDisposable; //eslint-disable-line

  this.subscriptions.add(
    atom.commands.add('atom-workspace', {
      'git-travel:toggle': function () {
        self.toggle();
      }
    })
  );
};

GitTravel.deactivate = function () {
  this.rightPanel.destroy();
  this.subscriptions.dispose();
  this.view.destroy();
};

GitTravel.serialize = function () {
  return {
    GitTravelViewState: this.view.serialize()
  };
};

GitTravel.toggle = function () {
  if (this.rightPanel.isVisible()) {
    this.rightPanel.hide();
  } else {
    this.getCommits();
    this.getReferences();
    this.rightPanel.show();
  }
};

module.exports = GitTravel;
