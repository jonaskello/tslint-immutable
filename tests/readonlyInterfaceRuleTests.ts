import * as TestHelper from "./TestHelper";

describe("readonlyInterfaceRule", (): void => {

  const RULE_NAME: string = "readonly-interface";

  it("should not produce violations", (): void => {
    const script : string = `
      interface Foo {
        readonly bar: number,
        readonly zoo(): string
        readonly loo: Array<string>
      }
    `;
    TestHelper.assertNoViolation(RULE_NAME, script);
  });

  it("should produce violations", (): void => {
    const script : string = `
      interface Foo {
        bar: number,
        zoo(): string
        loo: Array<string>
      }
    `;
    TestHelper.assertViolations(RULE_NAME, script, [
      {
        "failure": "Only readonly members allowed in interfaces.",
        "name": "file.ts",
        "ruleName": "readonly-interface",
        "startPosition": {
          "line": 3,
          "character": 9
        }
      },
      {
        "failure": "Only readonly members allowed in interfaces.",
        "name": "file.ts",
        "ruleName": "readonly-interface",
        "startPosition": {
          "line": 4,
          "character": 9
        }
      },
      {
        "failure": "Only readonly members allowed in interfaces.",
        "name": "file.ts",
        "ruleName": "readonly-interface",
        "startPosition": {
          "line": 5,
          "character": 9
        }
      }
    ]);
  });

});
