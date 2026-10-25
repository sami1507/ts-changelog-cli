# ts-changelog-cli

[![CI](https://github.com/sami1507/ts-changelog-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/sami1507/ts-changelog-cli/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6)

Generate release notes and suggest the next semantic version from your Git history, using [Conventional Commits](https://www.conventionalcommits.org).

Teams usually either write changelogs by hand or pull in a large release toolchain. `changelog-gen` does one job: read the commits since the last release, decide whether the release is a major, minor or patch bump, and print Markdown release notes that can be pasted into `CHANGELOG.md` or a GitHub release.

## Features

- Parses Conventional Commit headers, including scopes, `!` breaking markers and `BREAKING CHANGE:` footers
- Suggests the semver bump (`major`, `minor`, `patch` or `none`) for any git revision range
- Renders Markdown grouped by type, with breaking changes listed first and commit hashes linked to the repository
- `--json` output for release pipelines
- The core is pure and unit-tested; the Git layer is a thin wrapper around `git log`
- Strict TypeScript, ESM, Node.js 20+, no runtime dependencies

## Getting started

```bash
git clone https://github.com/sami1507/ts-changelog-cli.git
cd ts-changelog-cli
npm ci
npm run build
node dist/cli.js --help
```

To expose the `changelog-gen` command on your machine, run `npm link`.

## Usage

Release notes for everything since the last tag:

```bash
node dist/cli.js --range v1.4.0..HEAD --current 1.4.0 --repo https://github.com/owner/repo
```

Machine-readable output for a CI job:

```bash
node dist/cli.js --range v1.4.0..HEAD --current 1.4.0 --json
```

```json
{
  "bump": "minor",
  "version": "1.5.0",
  "commits": 7
}
```

Example Markdown output:

```markdown
## [1.5.0] - 2026-10-25

### Features

- **cli:** add --json output ([3f9c2a1](https://github.com/owner/repo/commit/3f9c2a1...))

### Bug Fixes

- **parser:** trim whitespace from commit headers ([9b1e0d4](https://github.com/owner/repo/commit/9b1e0d4...))
```

## How the bump is chosen

| Commits in range                           | Suggested bump |
| ------------------------------------------ | -------------- |
| Any `feat!:` / `fix!:` or `BREAKING CHANGE:` footer | `major`        |
| At least one `feat:`                       | `minor`        |
| `fix:` or `perf:` only                     | `patch`        |
| Everything else (`chore:`, `docs:`, ...)   | `none`         |

## Development

```bash
npm ci
npm test            # Vitest unit tests
npm run typecheck   # tsc --noEmit with strict mode
npm run build       # emits dist/ with .d.ts files
```

Project layout:

```text
src/
  commit.ts      Conventional Commit parsing and git log splitting
  bump.ts        Semver bump suggestion and version arithmetic
  changelog.ts   Markdown rendering
  git.ts         Reads commits through `git log`
  cli.ts         Command-line entry point
test/            Unit tests for the pure modules
```

## License

MIT. See [LICENSE](LICENSE).
