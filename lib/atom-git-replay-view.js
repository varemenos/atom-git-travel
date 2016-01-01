'use strict';

var $ = require('jquery');
var NodeGit = require('nodegit');
var Reset = NodeGit.Reset;
var utils = require('./utils');
var templates = require('./templates');
var CompositeDisposable = require('atom').CompositeDisposable;

var prepareDom = function (el) {
  el
    .addClass('atom-git-replay padded')
    .append(templates.panels.branches())
    .append(templates.panels.tags())
    .append(templates.panels.commits());
};

var AtomGitReplayView = function (serializedState) { // eslint-disable-line no-unused-vars
  this.subscriptions = new CompositeDisposable; // eslint-disable-line new-parens

  this.element = document.createElement('div');
  var el = $(this.element);

  prepareDom(el);

  el.on('click', '.commit', function (e) {
    var target = $(e.target);
    var oid = target.data('id');

    utils.getRepo()
      .then((repo) => {
        repo.setHeadDetached(oid);

        return Reset.reset(repo, oid, Reset.TYPE.HARD);
      })
      .then((result) => console.log('reset result: ' + result))
      .catch((err) => console.log(err));
  });

  el.on('click', '.branch', function (e) {
    var target = $(e.target);

    var name = target.data('name');
    var ref = 'refs/heads/' + name;

    utils.getRepo()
      .then((repo) => {
        return repo.checkoutBranch(ref);
      })
      .then((result) => {
        if (result === 0) {
          target.parent().children().removeClass('selected');
          target.addClass('selected');
        } else { // handle error
        }
      })
      .catch((err) => console.log(err));
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

  var panel = $(this.element).find(`.${type}s-panel`);

  items.length ? panel.show() : panel.hide();

  items
    .map((item) => {
      target.append(templates.item(type, item));

      var currentElement = target.children().last();

      self.subscriptions.add(
        atom.tooltips.add(currentElement[0], {
          title: item.name || item.ref.message()
        })
      );
    });
};

module.exports = AtomGitReplayView;
