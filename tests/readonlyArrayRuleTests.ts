import * as TestHelper from "./TestHelper";

describe("readonlyArrayRule", (): void => {

  const RULE_NAME: string = "readonly-array";

  it("should not produce violations", (): void => {
    const script : string = `
      const foo: ReadonlyArray<string> = [];
    `;
    TestHelper.assertNoViolation(RULE_NAME, script);
  });

  it("should produce violations", (): void => {
    const script : string = `
      const foo: Array<string> = [];
    `;
    TestHelper.assertViolations(RULE_NAME, script, [
      {
        "failure": "Only ReadonlyArray allowed.",
        "name": "file.ts",
        "ruleName": "readonly-array",
        "startPosition": {
          "line": 2,
          "character": 18
        }
      }
    ]);
  });

});
