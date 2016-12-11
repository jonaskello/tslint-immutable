# tslint-immutable

[TSLint](https://palantir.github.io/tslint/) rules to disable  mutation in TypeScript.

> NOTE: tslint-immutable >= 2.0.0 is compatible with tslint >= 4.0.0. For older versions that is compatible with older tslint versions please check the [v1](https://github.com/jonaskello/tslint-immutable/tree/v1) branch.

## Background

In some projects it is important to not mutatable any data, for example when using Redux to store state in a React application. Moreover immutable data structures has a lot of advantages in general so I want to use them everywhere in my applications. 

I originally used [immutablejs](https://github.com/facebook/immutable-js/) for this purpose. It is a really nice library but I found it had some drawbacks. Specifically when debugging it was hard to see the structure, creating JSON was not straightforward, and passing parameters to other libraries required converting to regular mutable arrays and objects. The [seamless-immutable](https://github.com/rtfeldman/seamless-immutable) project seems to have the same conclusions and they use regular objects and arrays and check for immutability at run-time. This solves all the aformentioned drawbacks but introduces a new drawback of only being enforced at run-time. (Altough you loose the structural sharing feature of immutablejs with this solution so you would have to consider if that is something you need).

Then typescript 2.0 came along and introduced [readonly](https://github.com/Microsoft/TypeScript/wiki/What's-new-in-TypeScript#read-only-properties-and-index-signatures) options for properties, indexers and arrays. This enables us to use regular object and arrays and have the immutability enfored at compile time instead of run-time. Now the only drawback is that there is nothing enforcing the use of readonly in typescript.

This can be solved by using linting rules. So the aim of this project is to leverage the type system in typescript to enforce immutability at compile-time while still using regular objects and arrays.

## Installing

`npm install tslint-immutable --save-dev`

## TSLint Rules

In addition to immutable rules this project also contains a few rules for enforcing a functional style and a few other rules. The following rules are available:

### Immutability rules

#### readonly-interface

This rule enforces having the `readonly` modifier on all interface members.

You might think that prohibiting the use of `let` and `var` would eliminate mutation from your TypeScript code. **Wrong.** Turns out that there's a pretty big loophole in `const`.

```TypeScript
interface Point { x: number, y: number }
const point: Point = { x: 23, y: 44 };
point.x = 99; // This is legal
```

This is why the `readonly-interface` rule exists. This rule prevents you from assigning a value to the result of a member expression.

```TypeScript
interface Point { readonly x: number, readonly y: number }
const point: Point = { x: 23, y: 44 };
point.x = 99; // <- No object mutation allowed.
```

This rule is just as effective as using Object.freeze() to prevent mutations in your Redux reducers. However this rule has **no run-time cost**, and is enforced at **compile time**.  A good alternative to object mutation is to use the object spread [syntax](https://github.com/Microsoft/TypeScript/wiki/What's-new-in-TypeScript#object-spread-and-rest) that was added in typescript 2.1.

```TypeScript
interface Point { readonly x: number, readonly y: number }
const point: Point = { x: 23, y: 44 };
const transformedPoint = { ...point, x: 99 };
```

#### readonly-array

This rule enforces use of `ReadonlyArray<T>` instead of `Array<T>` or `T[]`.

Even if an array is declared with `const` it is still possible to mutate the contents of the array.

```TypeScript
interface Point { readonly x: number, readonly y: number }
const points: Array<Point> = [{ x: 23, y: 44 }];
points.push({ x: 1, y: 2 }); // This is legal
```

Using the readonly-array rule will stop this mutation:

```TypeScript
interface Point { readonly x: number, readonly y: number }
const points: ReadonlyArray<Point> = [{ x: 23, y: 44 }];
points.push({ x: 1, y: 2 }); // Unresolved method push()
```

#### no-let 
This rule should be combined with tslint's built-in `no-var` rule to enforce that all variables are declared as `const`.

There's no reason to use `let` in a Redux/React application, because all your state is managed by either Redux or React. Use `const` instead, and avoid state bugs altogether.

```TypeScript
let x = 5; // <- Unexpected let or var, use const.
```

What about `for` loops? Loops can be replaced with the Array methods like `map`, `filter`, and so on. If you find the built-in JS Array methods lacking, use [ramda](http://ramdajs.com/), or [lodash-fp](https://github.com/lodash/lodash/wiki/FP-Guide).

```TypeScript
const SearchResults = 
  ({ results }) => 
    <ul>{
      results.map(result => <li>result</li>) // <- Who needs let?
    }</ul>;
```

#### no-this, no-class, no-new
Thanks to libraries like [recompose](https://github.com/acdlite/recompose) and Redux's [React Container components](http://redux.js.org/docs/basics/UsageWithReact.html), there's not much reason to build Components using `React.createClass` or ES6 classes anymore. The `no-this` rule makes this explicit.

```TypeScript
const Message = React.createClass({
  render: function() {
    return <div>{ this.props.message }</div>; // <- no this allowed
  }
})
```
Instead of creating classes, you should use React 0.14's [Stateless Functional Components](https://medium.com/@joshblack/stateless-components-in-react-0-14-f9798f8b992d#.t5z2fdit6) and save yourself some keystrokes:

```TypeScript
const Message = ({message}) => <div>{ message }</div>;
```

What about lifecycle methods like `shouldComponentUpdate`? We can use the [recompose](https://github.com/acdlite/recompose) library to apply these optimizations to your Stateless Functional Components. The [recompose](https://github.com/acdlite/recompose) library relies on the fact that your Redux state is immutable to efficiently implement shouldComponentUpdate for you.

```TypeScript
import { pure, onlyUpdateForKeys } from 'recompose';

const Message = ({message}) => <div>{ message }</div>;

// Optimized version of same component, using shallow comparison of props
// Same effect as React's PureRenderMixin
const OptimizedMessage = pure(Message);

// Even more optimized: only updates if specific prop keys have changed
const HyperOptimizedMessage = onlyUpdateForKeys(['message'], Message);
```

### Functional style rules

#### no-mixed-interface

Mixing functions and data properties in the same interface is a sign of object-orientation style. This rule enforces that an inteface only has one type of members, eg. only data properties or only functions.  

#### no-expression-statement
When you call a function and don’t use it’s return value, chances are high that it is being called for its side effect. e.g.

```TypeScript
array.push(1)
alert('Hello world!')
```

This rule checks that the value of an expression is assigned to a variable and thus helps promote side-effect free (pure) functions.

### Other rules

#### import-containment

ECMAScript modules does not have a concept of a library that can span multiple files and share internal members. If you have a set of files that forms an library, and they need to be able to call each other internally without exposing members to other files outside the library set, this rule can be useful.

#### no-arguments

Disallows use of the `arguments` keyword.

#### no-label

Disallows the use of labels, and indirectly also `goto`.

#### semicolon-interface

Ensures that interfaces only use commas as separator instead semicolor.
 
```TypeScript
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

## Sample Configuration File

Here's a sample TSLint configuration file (tslint.json) that activates all the recommended rules:

```json
{
  "rulesDirectory": "path/to/tslint-immutable/rules",
  "rules": {
    "no-let": true,
    "no-this": true,
    "no-mutation": true,
    "no-expression-statement": true,
    "no-var-keyword": true
  }
}
```

## Prior work

This work was originally inspired by [eslint-plugin-immutable](https://github.com/jhusain/eslint-plugin-immutable).
