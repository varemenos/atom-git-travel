'use strict';

var $ = require('jquery');
var NodeGit = require('nodegit');
var utils = require('./utils');
var Checkout = NodeGit.Checkout;
var Reset = NodeGit.Reset;
var CompositeDisposable = require('atom').CompositeDisposable;

var AtomGitReplayView = function (serializedState) {
  this.subscriptions = new CompositeDisposable; //eslint-disable-line

  this.element = document.createElement('div');
  var el = $(this.element);

  el
    .addClass('atom-git-replay padded')
    .append(`
      <div class="inset-panel branchs-panel">
        <div class="panel-heading">
          <span class='icon icon-git-branch'></span>
          Branches
        </div>
        <div class="panel-body padded"></div>
      </div>
    `)
    .append(`
      <div class="inset-panel tags-panel">
        <div class="panel-heading">
          <span class='icon icon-git-branch'></span>
          Tags
        </div>
        <div class="panel-body padded"></div>
      </div>
    `)
    .append(`
      <div class="inset-panel commits-panel">
        <div class="panel-heading">
          <span class='icon icon-git-commit'></span>
          Commits
        </div>
        <div class="panel-body padded"></div>
      </div>
    `);

  el.on('click', '.commit', function (e) {
    var target = $(e.target);

    var commitId = target.data('id');

    utils.getRepo()
    .then(function (repo) {
      Checkout
        .tree(repo, commitId, {
          checkoutStrategy: Checkout.STRATEGY.SAFE_CREATE
        })
        .then(function () {
          return repo.setHeadDetached(commitId, repo.defaultSignature, 'Checkout: HEAD ' + commitId);
        })
        .then(function (result) {
          return Reset.reset(repo, repo.getHeadCommit(), Reset.TYPE.HARD);
        })
        .then(function (result) {
          console.log('reset: ' + result);
        })
        .catch(function (err) {
          console.log(err);
        });
    });
  });
};

AtomGitReplayView.prototype.serialize = function () {
};

AtomGitReplayView.prototype.destroy = function () {
  this.subscriptions.dispose();
  this.element.remove();
};

AtomGitReplayView.prototype.getElement = function () {
  return this.element;
};

AtomGitReplayView.prototype.updateElement = function (type, items) {
  var self = this;
  var target = $(this.element).find(`.${type}s-panel .panel-body`);

  $(target).html('');

  if (items.length) {
    $(this.element).find(`.${type}s-panel`).show();
  } else {
    $(this.element).find(`.${type}s-panel`).hide();
  }

  items.forEach(function (item) {
    var result = `
      <button
        class="${type} btn ${item.current ? 'selected' : ''}"
        data-id="${item.ref.id()}"
      >
        ${item.name || item.ref.message()}
      </button>
    `;

    target.append(result);

    var currentElement = target.children().last();

    self.subscriptions.add(
      atom.tooltips.add(currentElement[0], {
        title: item.name || item.ref.message()
      })
    );
  });
};

module.exports = AtomGitReplayView;
