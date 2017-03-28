# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) 
and this project adheres to [Semantic Versioning](http://semver.org/).

## [2.1.1] - 2017-03-29
### Fixed
- Remove vestigial `noMutationRule.js` and `no-mutation` example from README, thanks to @pmlamotte. (see #6)

## [2.1.0] - 2016-12-12
### Added
- `readonly-indexer` rule.

### Fixed
- Fixed a bug in `readonly-interface` rule that made it fail on indexer declarations.

## [2.0.0] - 2016-12-12
### Added
- `readonly-interface` rule.
- `readonly-indexer` rule.
- `readonly-array` rule.
- `no-class` rule.
- `no-new` rule.
- `no-mixed-interface` rule.
- `import-containment` rule.
- `no-arguments` rule.
- `no-label` rule.
- `no-semicolon-interface` rule.

### Removed
- `no-mutation` rule (replaced by the `readonly-interface` rule).

## [1.0.0] - 2016-12-10
### Added
- `no-expression-statement` rule.
- `no-let` rule.
- `no-mutation` rule.
- `no-this` rule.
