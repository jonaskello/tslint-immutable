# tslint-immutable

[TSLint](https://palantir.github.io/tslint/) rules to disable  mutation in TypeScript.

> NOTE: tslint-immutable 2.0.0 and above is compatible with typescript 2.0, tslint 4.0 and above. If you are looking for the old version please check the v1 branch.

## Background

In some projects it is important to not mutatable any data, for example when using redux to store state in a react application. Moreover immutable data structures has a lot of advantages in general so I want to use them everywhere in my applications. 

I originally used [immutablejs](https://github.com/facebook/immutable-js/) for this purpose. It is a really nice library but I found it had some drawbacks. Specifically when debugging it was hard to see the structure, creating JSON was not straightforward, and passing parameters to other libraries required converting to regular mutable arrays and objects. The [seamless-immutable](https://github.com/rtfeldman/seamless-immutable) project seems to have the same conclusions and they use regular objects and arrays and check for immutability at run-time. This solves all the aformentioned drawbacks but introduces a new drawback of only being enforced at run-time. ()Altough you loose the structural sharing feature of immutablejs with this solution so you would have to consider if that is something you need).

Then typescript 2.0 came along and introduced [readonly](https://github.com/Microsoft/TypeScript/wiki/What's-new-in-TypeScript#read-only-properties-and-index-signatures) options for properties, indexers and arrays. This enables us to use regular object and arrays and have the immutability enfored at compile time instead of run-time. Now the only drawback is that there is nothing enforcing the use of readonly in typescript.

This can be solved by using linting rules. So the aim of this project is to leverage the type system in typescript to enforce immutability at compile-time while still using regular objects and arrays.

## Installing

`npm install tslint-immutable --save-dev`

## TSLint Rules
There following rules are availavle:

### no-let 
See eslint version for [documentation](https://github.com/jhusain/eslint-plugin-immutable/blob/master/README.md#no-let).

### no-this
See eslint version for [documentation](https://github.com/jhusain/eslint-plugin-immutable/blob/master/README.md#no-this).

### no-mutation
See eslint version for [documentation](https://github.com/jhusain/eslint-plugin-immutable/blob/master/README.md#no-mutation).

### no-expression-statement
When you call a function and don’t use it’s return value, chances are high that it is being called for its side effect. e.g.

```TypeScript
array.push(1)
alert('Hello world!')
```

This rule checks that the value of an expression is assigned to a variable. However it will still be possible to perform mutations, eg. this rule will not catch these expressions:

```TypeScript
const namesWithBar = names.concat([' bar ']) // ok, bound to another variable
return namesWithBar // ok, returned
const newSize = names.push('baz') // maybe `no-unused-vars` can catch this
const newObject = Object.assign(oldObject, { foo: 'bar' }) // tough luck
```

## Supplementary TSLint Rules to Enable

The rules in this package alone can not eliminate mutation in your TypeScript programs. To go the distance I suggest you also enable the following built-in TSLint rules:

* no-var-keyword (self-explanatory)

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
