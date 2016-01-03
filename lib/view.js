'use strict';

var $ = require('jquery');
var NodeGit = require('nodegit');
var utils = require('./utils');
var templates = require('./templates');
var CompositeDisposable = require('atom').CompositeDisposable;

var GitTravelView = function (serializedState) { // eslint-disable-line no-unused-vars
  this.subscriptions = new CompositeDisposable; // eslint-disable-line new-parens

  this.element = document.createElement('div');
  this.$element = $(this.element);

  this.$element
    .addClass('git-travel padded')
    .append(templates.panels.branches())
    .append(templates.panels.tags())
    .append(templates.panels.commits());

  this.$element.on('click', '.commit', function (e) {
    var target = $(e.target);
    var oid = target.data('id');

    utils.getRepo()
      .then((repo) => {
        repo.setHeadDetached(oid);

        utils.setSelected(target);

        return NodeGit.Checkout.head(repo, {
          checkoutStrategy: NodeGit.Checkout.STRATEGY.FORCE
        });
      })
      .catch((err) => console.log(err));
  });

  this.$element.on('click', '.branch', function (e) {
    var target = $(e.target);

    var name = target.data('name');
    var ref = 'refs/heads/' + name;
    var repo;

    utils.getRepo()
      .then((r) => {
        repo = r;
        repo.checkoutBranch(ref);
      })
      .then((err) => {
        if (!err) {
          utils.setSelected(target);

          return NodeGit.Checkout.head(repo, {
            checkoutStrategy: NodeGit.Checkout.STRATEGY.FORCE
          });
        }
      })
      .catch((err) => console.log(err));
  });
};

GitTravelView.prototype.serialize = function () {};

GitTravelView.prototype.destroy = function () {
  this.subscriptions.dispose();
  this.element.remove();
};

GitTravelView.prototype.getElement = function () {
  return this.element;
};

GitTravelView.prototype.updateElement = function (type, items) {
  var panel = this.$element.find(`.${type}s-panel`);
  var target = panel.find('.panel-body');

  target.empty();

  items.length ? panel.show() : panel.hide();

  items
    .map((item) => {
      target.append(templates.item(type, item));

      var currentElement = target.children().last()[0];

      this.subscriptions.add(
        atom.tooltips.add(currentElement, {
          title: item.name || item.ref.message()
        })
      );
    });
};

module.exports = GitTravelView;
