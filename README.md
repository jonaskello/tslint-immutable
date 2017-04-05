# tslint-immutable

[![npm version][version-image]][version-url]
[![travis build][travis-image]][travis-url]
[![MIT license][license-image]][license-url]

[TSLint](https://palantir.github.io/tslint/) rules to disable  mutation in TypeScript.

## Background

In some applications it is important to not mutate any data, for example when using Redux to store state in a React application. Moreover immutable data structures has a lot of advantages in general so I want to use them everywhere in my applications. 

I originally used [immutablejs](https://github.com/facebook/immutable-js/) for this purpose. It is a really nice library but I found it had some drawbacks. Specifically when debugging it was hard to see the structure, creating JSON was not straightforward, and passing parameters to other libraries required converting to regular mutable arrays and objects. The [seamless-immutable](https://github.com/rtfeldman/seamless-immutable) project seems to have the same conclusions and they use regular objects and arrays and check for immutability at run-time. This solves all the aformentioned drawbacks but introduces a new drawback of only being enforced at run-time. (Altough you loose the structural sharing feature of immutablejs with this solution so you would have to consider if that is something you need).

Then typescript 2.0 came along and introduced [readonly](https://github.com/Microsoft/TypeScript/wiki/What's-new-in-TypeScript#read-only-properties-and-index-signatures) options for properties, indexers and arrays. This enables us to use regular object and arrays and have the immutability enfored at compile time instead of run-time. Now the only drawback is that there is nothing enforcing the use of readonly in typescript.

This can be solved by using linting rules. So the aim of this project is to leverage the type system in typescript to enforce immutability at compile-time while still using regular objects and arrays.

## Installing

`npm install tslint-immutable --save-dev`

## Compability

* tslint-immutable 3.x.x is compatible with tslint 5.x.x. 
* tslint-immutable 2.x.x is compatible with tslint 4.x.x.
* tslint-immutable 1.x.x is compatible with tslint 3.x.x.

## TSLint Rules

In addition to immutable rules this project also contains a few rules for enforcing a functional style of programming and a few other rules. The following rules are available:

* [Immutability rules](#immutability-rules)
  * [readonly-interface](#readonly-interface)
  * [readonly-indexer](#readonly-indexer)
  * [readonly-array](#readonly-array)
  * [no-let](#no-let)
* [Functional style rules](#functional-style-rules)
  * [no-this](#no-this-no-class-no-new)
  * [no-class](#no-this-no-class-no-new)
  * [no-new](#no-this-no-class-no-new)
  * [no-mixed-interface](#no-mixed-interface)
  * [no-expression-statement](#no-expression-statement)
* [Other rules](#other-rules)
  * [no-arguments](#no-arguments)
  * [no-label](#no-label)
  * [no-semicolon-interface](#no-semicolon-interface)
  * [import-containment](#import-containment)

### Immutability rules

#### readonly-interface

This rule enforces having the `readonly` modifier on all interface members.

You might think that using `const` would eliminate mutation from your TypeScript code. **Wrong.** Turns out that there's a pretty big loophole in `const`.

```typescript
interface Point { x: number, y: number }
const point: Point = { x: 23, y: 44 };
point.x = 99; // This is legal
```

This is why the `readonly-interface` rule exists. This rule prevents you from assigning a value to the result of a member expression.

```typescript
interface Point { readonly x: number, readonly y: number }
const point: Point = { x: 23, y: 44 };
point.x = 99; // <- No object mutation allowed.
```

This rule is just as effective as using Object.freeze() to prevent mutations in your Redux reducers. However this rule has **no run-time cost**, and is enforced at **compile time**.  A good alternative to object mutation is to use the ES2016 object spread [syntax](https://github.com/Microsoft/TypeScript/wiki/What's-new-in-TypeScript#object-spread-and-rest) that was added in typescript 2.1:

```typescript
interface Point { readonly x: number, readonly y: number }
const point: Point = { x: 23, y: 44 };
const transformedPoint = { ...point, x: 99 };
```

#### readonly-indexer

This rule enforces all indexers to have the readonly modifier.

```typescript
// NOT OK
let foo: { [key:string]: number }; 
// OK
let foo: { readonly [key:string]: number }; 
```

#### readonly-array

This rule enforces use of `ReadonlyArray<T>` instead of `Array<T>` or `T[]`.

Even if an array is declared with `const` it is still possible to mutate the contents of the array.

```typescript
interface Point { readonly x: number, readonly y: number }
const points: Array<Point> = [{ x: 23, y: 44 }];
points.push({ x: 1, y: 2 }); // This is legal
```

Using the readonly-array rule will stop this mutation:

```typescript
interface Point { readonly x: number, readonly y: number }
const points: ReadonlyArray<Point> = [{ x: 23, y: 44 }];
points.push({ x: 1, y: 2 }); // Unresolved method push()
```

Options: 
- [ignore-local](#using-the-ignore-local-option)
- [ignore-prefix](#using-the-ignore-prefix-option)

Example config:
```javascript
"readonly-array": true
```
```javascript
"readonly-array": [true, "ignore-local"]
```
```javascript
"readonly-array": [true, "ignore-local", {"ignore-prefix": "mutable"}]
```

#### no-let
This rule should be combined with tslint's built-in `no-var-keyword` rule to enforce that all variables are declared as `const`.

There's no reason to use `let` in a Redux/React application, because all your state is managed by either Redux or React. Use `const` instead, and avoid state bugs altogether.

```typescript
let x = 5; // <- Unexpected let or var, use const.
```

What about `for` loops? Loops can be replaced with the Array methods like `map`, `filter`, and so on. If you find the built-in JS Array methods lacking, use [ramda](http://ramdajs.com/), or [lodash-fp](https://github.com/lodash/lodash/wiki/FP-Guide).

```typescript
const SearchResults = 
  ({ results }) => 
    <ul>{
      results.map(result => <li>result</li>) // <- Who needs let?
    }</ul>;
```

### Functional style rules

#### no-this, no-class, no-new
Thanks to libraries like [recompose](https://github.com/acdlite/recompose) and Redux's [React Container components](http://redux.js.org/docs/basics/UsageWithReact.html), there's not much reason to build Components using `React.createClass` or ES6 classes anymore. The `no-this` rule makes this explicit.

```typescript
const Message = React.createClass({
  render: function() {
    return <div>{ this.props.message }</div>; // <- no this allowed
  }
})
```
Instead of creating classes, you should use React 0.14's [Stateless Functional Components](https://medium.com/@joshblack/stateless-components-in-react-0-14-f9798f8b992d#.t5z2fdit6) and save yourself some keystrokes:

```typescript
const Message = ({message}) => <div>{ message }</div>;
```

What about lifecycle methods like `shouldComponentUpdate`? We can use the [recompose](https://github.com/acdlite/recompose) library to apply these optimizations to your Stateless Functional Components. The [recompose](https://github.com/acdlite/recompose) library relies on the fact that your Redux state is immutable to efficiently implement shouldComponentUpdate for you.

```typescript
import { pure, onlyUpdateForKeys } from 'recompose';

const Message = ({message}) => <div>{ message }</div>;

// Optimized version of same component, using shallow comparison of props
// Same effect as React's PureRenderMixin
const OptimizedMessage = pure(Message);

// Even more optimized: only updates if specific prop keys have changed
const HyperOptimizedMessage = onlyUpdateForKeys(['message'], Message);
```

#### no-mixed-interface

Mixing functions and data properties in the same interface is a sign of object-orientation style. This rule enforces that an inteface only has one type of members, eg. only data properties or only functions.  

#### no-expression-statement
When you call a function and don’t use it’s return value, chances are high that it is being called for its side effect. e.g.

```typescript
array.push(1)
alert('Hello world!')
```

This rule checks that the value of an expression is assigned to a variable and thus helps promote side-effect free (pure) functions.

### Other rules

#### no-arguments

Disallows use of the `arguments` keyword.

#### no-label

Disallows the use of labels, and indirectly also `goto`.

#### no-semicolon-interface

Ensures that interfaces only use commas as separator instead semicolor.
 
```typescript
// This is NOT ok.
inferface Foo {
  bar: string;
  zoo(): number;
}
// This is ok.
inferface Foo {
  bar: string,
  zoo(): number,
}
```

#### import-containment

ECMAScript modules does not have a concept of a library that can span multiple files and share internal members. If you have a set of files that forms an library, and they need to be able to call each other internally without exposing members to other files outside the library set, this rule can be useful.

## Options

### Using the `ignore-local` option

> If a tree falls in the woods, does it make a sound?
> If a pure function mutates some local data in order to produce an immutable return value, is that ok?

The quote above is from the [clojure docs](https://clojure.org/reference/transients). In general, it is more important to enforce immutability for state that is passed in and out of functions than for local state used for internal calculations within a function. For example in Redux, the state going in and out of reducers needs to be immutable while the reducer may be allowed to mutate local state in its calculations in order to achieve higher performance. This is what the `ignore-local` option enables. With this option enabled immutability will be enforced everywhere but in local state. Function parameters are not considered local state so they will still be checked.

Note that using this option can lead to more imperative code in funcitons so use with care!

### Using the `ignore-prefix` option

Some languages are immutable by default but allows you to explicitly declare mutable variables. For example in [reason](https://facebook.github.io/reason/) you can declare mutable record fields like this:

```reason
type person = {
  name: string,
  mutable age: int
};
```

Typescript is not immutable by default but it can be if you use this package. So in order to create an escape hatch similar to how it is done in reason the `ignore-mutable` option can be used. For example if you configure it to ignore variables with names that has the prefix "mutable" you can emulate the above example in typescript like this:

```typescript
type person = {
  readonly name: string,
  mutableAge: number // This is OK with ignore-prefix = "mutable"
};
```

Yes, variable names like `mutableAge` are ugly, but then again mutation is an ugly business :-).

## Sample Configuration File

Here's a sample TSLint configuration file (tslint.json) that activates all the rules:

```javascript
{
  "rulesDirectory": ["./node_modules/tslint-immutable/rules"],
  "rules": {

    // Immutability rules
    "readonly-interface": true,
    "readonly-indexer": true,
    "readonly-array": true,
    "no-let": true,
    "no-var-keyword": true, // built-in tslint rule

    // Functional style rules
    "no-this": true,
    "no-class": true,
    "no-new": true,
    "no-mixed-interface": true,
    "no-expression-statement": true,

    // Other rules
    "no-arguments": true,
    "no-label": true,
    "no-semicolon-interface": true,
    "import-containment": [ true,
    {
      "containmentPath": "path/to/libs",
      "allowedExternalFileNames": ["index"],
      "disallowedInternalFileNames": ["index"]
    }]

  }
}
```

## Prior work

This work was originally inspired by [eslint-plugin-immutable](https://github.com/jhusain/eslint-plugin-immutable).

[version-image]: https://img.shields.io/npm/v/tslint-immutable.svg?style=flat
[version-url]: https://www.npmjs.com/package/tslint-immutable
[travis-image]: https://travis-ci.org/jonaskello/tslint-immutable.svg?branch=master&style=flat
[travis-url]: https://travis-ci.org/jonaskello/tslint-immutable
[license-image]: https://img.shields.io/github/license/jonaskello/tslint-immutable.svg?style=flat
[license-url]: https://opensource.org/licenses/MIT
