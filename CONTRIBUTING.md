# Contributing to Nexos

Thanks for your interest in contributing to Nexos! This document describes the
branching model and the rules for opening pull requests.

## Branches

| Branch | Purpose                                                                      |
| ------ | ---------------------------------------------------------------------------- |
| `main` | Stable release code. Only receives changes from `next` via a pull request.   |
| `next` | Pre-release code. All contributions are created from and target this branch. |

## What `next` means

`next` is the pre-release channel. Code on this branch has passed the project's
validation (unit tests, type-check, lint, formatting, and security audit) and is
intended to ship in an upcoming stable release.

It is **not** stable yet:

- APIs may still change before they reach `main`.
- Individual changes may be reworked or removed before they reach `main`.

Only install `nexos@next` if you are comfortable with that. Everyone else should
stay on the latest stable release (`nexos@latest`).

## Pull request rules

1. Create your branch from `next`. Branch names are free-form (for example,
   `feat/proxy-events` or `fix/handler-bug`).
2. Rebase your branch onto `origin/next` before opening the pull request to keep
   a linear history:

   ```bash
   git fetch origin
   git rebase origin/next
   ```

3. Open your pull request targeting the `next` branch.
4. `main` only receives code from `next` through a pull request.

## Commit messages

This project follows
[Conventional Commits](https://www.conventionalcommits.org/). Use one of these
types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, or
`ci`.

Only `feat` and `fix` commits (or a `BREAKING CHANGE` footer) trigger a new
release.

## Development setup

```bash
# Requires Node.js 22 (see .node-version)
npm ci             # install dependencies
npm test           # run the unit tests
npm run type-check
npm run lint-check
npm run format-check
```

## License

By contributing, you agree that your contributions will be licensed under the
[MIT License](./license).
