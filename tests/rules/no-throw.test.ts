/**
 * @fileoverview Tests for no-throw
 */

import dedent from "dedent";
import { Rule, RuleTester } from "eslint";
import { name, rule } from "../../src/rules/noThrow";
import { es3, typescript } from "../configs";

// Valid test cases.
const valid: Array<string | RuleTester.ValidTestCase> = [];

// Invalid test cases.
const invalid: Array<RuleTester.InvalidTestCase> = [
  {
    code: `throw 'error';`,
    errors: [
      {
        messageId: "generic",
        line: 1,
        column: 1
      }
    ]
  },
  {
    code: `throw new Error();`,
    errors: [
      {
        messageId: "generic",
        line: 1,
        column: 1
      }
    ]
  },
  {
    code: dedent`
      var error = new Error();
      throw error;`,
    errors: [
      {
        messageId: "generic",
        line: 2,
        column: 1
      }
    ]
  }
];

describe("TypeScript", () => {
  const ruleTester = new RuleTester(typescript);
  ruleTester.run(name, rule as Rule.RuleModule, { valid, invalid });
});

describe("JavaScript (es3)", () => {
  const ruleTester = new RuleTester(es3);
  ruleTester.run(name, rule as Rule.RuleModule, { valid, invalid });
});