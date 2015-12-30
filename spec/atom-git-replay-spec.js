var AtomGitReplay;

AtomGitReplay = require('../lib/atom-git-replay');

describe("AtomGitReplay", function() {
  var activationPromise, ref, workspaceElement;
  ref = [], workspaceElement = ref[0], activationPromise = ref[1];
  beforeEach(function() {
    workspaceElement = atom.views.getView(atom.workspace);
    return activationPromise = atom.packages.activatePackage('atom-git-replay');
  });
  return describe("when the atom-git-replay:toggle event is triggered", function() {
    it("hides and shows the modal panel", function() {
      expect(workspaceElement.querySelector('.atom-git-replay')).not.toExist();
      atom.commands.dispatch(workspaceElement, 'atom-git-replay:toggle');
      waitsForPromise(function() {
        return activationPromise;
      });
      return runs(function() {
        var AtomGitReplayElement, AtomGitReplayPanel;
        expect(workspaceElement.querySelector('.atom-git-replay')).toExist();
        AtomGitReplayElement = workspaceElement.querySelector('.atom-git-replay');
        expect(AtomGitReplayElement).toExist();
        AtomGitReplayPanel = atom.workspace.panelForItem(AtomGitReplayElement);
        expect(AtomGitReplayPanel.isVisible()).toBe(true);
        atom.commands.dispatch(workspaceElement, 'atom-git-replay:toggle');
        return expect(AtomGitReplayPanel.isVisible()).toBe(false);
      });
    });
    return it("hides and shows the view", function() {
      jasmine.attachToDOM(workspaceElement);
      expect(workspaceElement.querySelector('.atom-git-replay')).not.toExist();
      atom.commands.dispatch(workspaceElement, 'atom-git-replay:toggle');
      waitsForPromise(function() {
        return activationPromise;
      });
      return runs(function() {
        var AtomGitReplayElement;
        AtomGitReplayElement = workspaceElement.querySelector('.atom-git-replay');
        expect(AtomGitReplayElement).toBeVisible();
        atom.commands.dispatch(workspaceElement, 'atom-git-replay:toggle');
        return expect(AtomGitReplayElement).not.toBeVisible();
      });
    });
  });
});
