# tslint-immutable

This repo contains a [TSLint](https://github.com/palantir/tslint) version of the [eslint-plugin-immutable
](https://github.com/jhusain/eslint-plugin-immutable).

This goal of these TSLint rules are to disable all mutation in TypeScript. Please see the [eslint-plugin-immutable](https://github.com/jhusain/eslint-plugin-immutable) version for the rationale beind this.

## Installing

`npm install tslint-immutable --save-dev`

## TSLint Rules
There are three rules in the plugin:

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
