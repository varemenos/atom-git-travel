'use strict';
var $ = require('jquery');
var NodeGit = require('nodegit');
var Checkout = NodeGit.Checkout;
var Reset = NodeGit.Reset;

var AtomGitReplayView = function (serializedState) {
  this.element = document.createElement('div');
  this.element.classList.add('atom-git-replay');

  $(this.element).on('click', '.commit', function (e) {
    var el = $(e.target);

    var commitId = el.data('id');

    NodeGit.Repository.open(path.resolve(atom.project.getPaths()[0]))
      .then(function(repo) {
        Checkout
          .tree(repo, commitId, {
            checkoutStrategy: Checkout.STRATEGY.SAFE_CREATE
          })
          .then(function() {
            return repo.setHeadDetached(commitId, repo.defaultSignature, "Checkout: HEAD " + commitId);
          })
          .then(function (result) {
            if (result) {
              return Reset.reset(repo, commitId, Reset.TYPE.HARD)
            } else {
              throw new Error(result);
            }
          })
          .then(function (result) {
            console.log('reset: ', result ? 'successful' : 'failed');
          });
    });
  });
};

AtomGitReplayView.prototype.serialize = function() {
};

AtomGitReplayView.prototype.destroy = function() {
  return this.element.remove();
};

AtomGitReplayView.prototype.getElement = function() {
  return this.element;
};

AtomGitReplayView.prototype.updateElement = function(commits) {
  var _this = this;

  $(_this.getElement()).html('');

  commits.forEach(function (commit) {
    var commit = `
      <button
        class="commit btn btn-default"
        data-id="${commit.id()}"
      >
        ${commit.message()}
      </button>
    `;

    $(_this.getElement()).append(commit);
  });

  return this.element;
};

module.exports = AtomGitReplayView;
