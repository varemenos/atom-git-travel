# Atom Git Travel

> An Atom package that helps you travel through branches, tags and commits :rocket:.

## Installation

```shell
apm install git-travel
```

## Screenshot

![screenshot](https://rawgit.com/varemenos/atom-git-travel/master/screenshot.png)

## Known Issues

1. If you get a `Cannot find module '../build/Debug/nodegit.node'` error when you try to toggle the package, visit this [link](https://github.com/varemenos/atom-git-travel/issues/1)
2. Clicking on a commit or a tag sets the HEAD to a detached state (matching the commit's or tag's) but unfortunately the staged and unstaged changes are still there. This is because Nodegit's Reset.reset() doesn't work and I'm still investigating the issue. For now you will have to manually execute `git reset --hard` after you click on a tag or commit.
3. Switching to another commit, branch or tag during a unclean state will through an error, once the issue above is fixed, it's functionality will be used to fix this issue as well.

## License

The MIT License
