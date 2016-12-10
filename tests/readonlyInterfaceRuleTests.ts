import * as TestHelper from "./TestHelper";

describe("readonlyInterfaceRule", (): void => {

  const RULE_NAME: string = "readonly-interface";

  it("should not produce violations", (): void => {
    const script : string = `
      interface Foo {
        readonly bar: number,
        readonly zoo(): string,
      }
    `;
    TestHelper.assertNoViolation(RULE_NAME, script);
  });

  it("should produce violations", (): void => {
    const script : string = `
      interface Foo {
        bar: number,
        zoo(): string,
      }
    `;
    TestHelper.assertViolations(RULE_NAME, script, [
      {
        "failure": "Do not use labels.",
        "name": "file.ts",
        "ruleName": "readonly-interface",
        "startPosition": {
          "line": 2,
          "character": 13
        }
      }
    ]);
  });

});
