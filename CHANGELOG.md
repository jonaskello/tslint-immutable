# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) 
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Fixed
- The readonly-keyword rule now properly checks for `readonly` modifier of `class` property declarations. See [49](https://github.com/jonaskello/tslint-immutable/issues/49) and PR [#50](https://github.com/jonaskello/tslint-immutable/pull/50).

### Added
- New rule [no-method-signature](https://github.com/jonaskello/tslint-immutable#no-method-signature). See [#30](https://github.com/jonaskello/tslint-immutable/issues/30) and PR in [#51](https://github.com/jonaskello/tslint-immutable/pull/51).
- New options `ignore-local`, and `ignore-prefix` for the `no-let` rule. See [#32](https://github.com/jonaskello/tslint-immutable/issues/39), also requested in [#43](https://github.com/jonaskello/tslint-immutable/issues/43). See PR [#48](https://github.com/jonaskello/tslint-immutable/pull/48).
- Added tslint core rule [no-parameter-reassignment](https://palantir.github.io/tslint/rules/no-parameter-reassignment/) as [recommended](https://github.com/jonaskello/tslint-immutable#no-parameter-reassignment) in the README.

## [v4.2.1] - 2017-09-21
### Fixed
- The readonly-array rule with ignore-local option does not work within `class`. See [45](https://github.com/jonaskello/tslint-immutable/issues/45).

## [v4.2.0] - 2017-09-14
### Added
- New option `ignore-prefix` for the `no-expression-statement` rule. See [#39](https://github.com/jonaskello/tslint-immutable/issues/39) for background. Thanks to [@algesten](https://github.com/algesten) for this option! (See PR [#42](https://github.com/jonaskello/tslint-immutable/pull/42))

## [v4.1.0] - 2017-08-21
### Added
- New rule `no-object-mutation`. See [#36](https://github.com/jonaskello/tslint-immutable/issues/36) for background. Thanks to [@miangraham](https://github.com/miangraham) for this rule! (See PR [#37](https://github.com/jonaskello/tslint-immutable/pull/37))

## [v4.0.2] - 2017-07-16
### Added
- Added an index.js file to the rules directory in order for rulesDirectory to work. See [#35](https://github.com/jonaskello/tslint-immutable/issues/35).

## [v4.0.1] - 2017-06-06
### Fixed
- Invalid default tslint config (it included the removed rules).

## [v4.0.0] - 2017-06-06
### Removed
- `readonly-interface` rule. This rule is replaced by the `readonly-keyword` rule. 
- `readonly-indexer` rule. This rule is replaced by the `readonly-keyword` rule. 
- `no-new` rule. Please see background in [#2](https://github.com/jonaskello/tslint-immutable/issues/2).
- `no-arguments` rule. This rule has been moved to the [tslint-divid](https://www.npmjs.com/package/tslint-divid) package.
- `no-label` rule. This rule has been moved to the [tslint-divid](https://www.npmjs.com/package/tslint-divid) package.
- `no-semicolon-interface` rule. This rule has been moved to the [tslint-divid](https://www.npmjs.com/package/tslint-divid) package.
- `import-containment` rule. This rule has been moved to the [tslint-divid](https://www.npmjs.com/package/tslint-divid) package.

## [v3.4.2] - 2017-05-14
### Added
- Notice in readme about deprecrating the `no-new` rule. 

### Deprecated
- The `no-new` rule. See [#2](https://github.com/jonaskello/tslint-immutable/issues/2) for background.

## [v3.4.1] - 2017-05-14
### Added
- Note in readme about moving the "other" rules. The `no-argument`, `no-label`, `no-semicolon-interface`, and `import containtment` rules are moving to [tslint-divid](https://github.com/jonaskello/tslint-divid). See  [#19](https://github.com/jonaskello/tslint-immutable/issues/19) for more information.

### Deprecated
- The `no-argument`, `no-label`, `no-semicolon-interface`, and `import containtment` rules as noted above.

## [v3.4.0] - 2017-05-14
### Added
- New rule `readonly-keyword`, to replace `readonly-interface` and `readonly-indexer` [#31](https://github.com/jonaskello/tslint-immutable/issues/31)

### Deprecated
- The `readonly-interface`, and `readonly-indexer` rules are deprecated and will be removed in the next major release. Please use the `readonly-keyword` rule instead.

## [v3.3.2] - 2017-05-13
### Fixed
- Functions in interfaces cannot have readonly specified but are still checked [#28](https://github.com/jonaskello/tslint-immutable/issues/28)

## [v3.3.1] - 2017-05-09
### Fixed
- patch: fix main file in package.json. Thanks to [@yonbeastie](https://github.com/yonbeastie). (see [#29](https://github.com/jonaskello/tslint-immutable/pull/29))

## [v3.3.0] - 2017-05-09
### Fixed
- ignore-local does not work for function assigned to const [#23](https://github.com/jonaskello/tslint-immutable/issues/23)

### Added
- Add default tslint json. Thanks to [@yonbeastie](https://github.com/yonbeastie). (see [#26](https://github.com/jonaskello/tslint-immutable/pull/26))

## [v3.2.0] - 2017-04-10
### Fixed
- readonly-array does not check shorthand syntax in return types with ignore-local option [#21](https://github.com/jonaskello/tslint-immutable/issues/21)

### Added
- Fixer for the `readonly-array` rule.

## [v3.1.2] - 2017-04-09
### Fixed
- readonly-array does not check return type when ignore-local is enabled [#16](https://github.com/jonaskello/tslint-immutable/issues/16)
- readonly-array does not check shorthand syntax [#20](https://github.com/jonaskello/tslint-immutable/issues/20).

## Changed
- Impicit return type is not checked in readonly-array [#18](https://github.com/jonaskello/tslint-immutable/issues/18).

## [v3.1.1] - 2017-04-05
### Fixed
- Function parameters are not checked when using ignore-local option, [#13](https://github.com/jonaskello/tslint-immutable/issues/13).
- Implicit Array type by default value for function parameter is not checked, [#14](https://github.com/jonaskello/tslint-immutable/issues/14).

## [v3.1.0] - 2017-04-05
### Added
- [`ignore-local`](https://github.com/jonaskello/tslint-immutable#using-the-ignore-local-option) option added to `readonly-array`.
- [`ignore-prefix`](https://github.com/jonaskello/tslint-immutable#using-the-ignore-local-option) option added to `readonly-array`.

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

[Unreleased]: https://github.com/jonaskello/tslint-immutable/compare/v4.2.1...master
[v4.2.1]: https://github.com/jonaskello/tslint-immutable/compare/v4.2.0...v4.2.1
[v4.2.0]: https://github.com/jonaskello/tslint-immutable/compare/v4.1.0...v4.2.0
[v4.1.0]: https://github.com/jonaskello/tslint-immutable/compare/v4.0.2...v4.1.0
[v4.0.2]: https://github.com/jonaskello/tslint-immutable/compare/v4.0.1...v4.0.2
[v4.0.1]: https://github.com/jonaskello/tslint-immutable/compare/v4.0.0...v4.0.1
[v4.0.0]: https://github.com/jonaskello/tslint-immutable/compare/v3.4.2...v4.0.0
[v3.4.2]: https://github.com/jonaskello/tslint-immutable/compare/v3.4.1...v3.4.2
[v3.4.1]: https://github.com/jonaskello/tslint-immutable/compare/v3.4.0...v3.4.1
[v3.4.0]: https://github.com/jonaskello/tslint-immutable/compare/v3.3.2...v3.4.0
[v3.3.2]: https://github.com/jonaskello/tslint-immutable/compare/v3.3.1...v3.3.2
[v3.3.1]: https://github.com/jonaskello/tslint-immutable/compare/v3.3.0...v3.3.1
[v3.3.0]: https://github.com/jonaskello/tslint-immutable/compare/v3.2.0...v3.3.0
[v3.2.0]: https://github.com/jonaskello/tslint-immutable/compare/v3.1.2...v3.2.0
[v3.1.2]: https://github.com/jonaskello/tslint-immutable/compare/v3.1.1...v3.1.2
[v3.1.1]: https://github.com/jonaskello/tslint-immutable/compare/v3.1.0...v3.1.1
[v3.1.0]: https://github.com/jonaskello/tslint-immutable/compare/v3.0.0...v3.1.0
[v3.0.0]: https://github.com/jonaskello/tslint-immutable/compare/v2.1.1...v3.0.0
[v2.1.2]: https://github.com/jonaskello/tslint-immutable/compare/v2.1.1...v2.1.2
[v2.1.1]: https://github.com/jonaskello/tslint-immutable/compare/v2.1.0...v2.1.1
[v2.1.0]: https://github.com/jonaskello/tslint-immutable/compare/v2.0.0...v2.1.0
[v2.0.0]: https://github.com/jonaskello/tslint-immutable/compare/v1.0.0...v2.0.0
