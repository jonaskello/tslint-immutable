# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) 
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added
- `ignore-local` option added to `readonly-array`.
- `ignore-prefix` option added to `readonly-array`.

## [v3.0.0] - 2017-04-02
### Changed
- Upgraded to tslint 5.0.0

### Added
- `readonly-array` now also checks for implicity declared mutable arrays.

## [v2.1.1] - 2017-03-29
### Fixed
- Remove vestigial `noMutationRule.js` and `no-mutation` example from README, thanks to [@pmlamotte](https://github.com/pmlamotte). (see [#6](https://github.com/jonaskello/tslint-immutable/pull/6))

## [v2.1.0] - 2016-12-12
### Added
- `readonly-indexer` rule.

### Fixed
- Fixed a bug in `readonly-interface` rule that made it fail on indexer declarations.

## [v2.0.0] - 2016-12-12
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

## v1.0.0 - 2016-12-10
### Added
- `no-expression-statement` rule.
- `no-let` rule.
- `no-mutation` rule.
- `no-this` rule.

[Unreleased]: https://github.com/jonaskello/tslint-immutable/compare/v3.0.0...master
[v3.0.0]: https://github.com/jonaskello/tslint-immutable/compare/v2.1.1...v3.0.0
[v2.1.2]: https://github.com/jonaskello/tslint-immutable/compare/v2.1.1...v2.1.2
[v2.1.1]: https://github.com/jonaskello/tslint-immutable/compare/v2.1.0...v2.1.1
[v2.1.0]: https://github.com/jonaskello/tslint-immutable/compare/v2.0.0...v2.1.0
[v2.0.0]: https://github.com/jonaskello/tslint-immutable/compare/v1.0.0...v2.0.0
