import * as TestHelper from "./TestHelper";

describe("readonlyIndexerRule", (): void => {

  const RULE_NAME: string = "readonly-indexer";

  it("indexer with readonly modifier should not produce violations", (): void => {
    const script : string = `
      let foo: {readonly [key: string]: number};
    `;
    TestHelper.assertNoViolation(RULE_NAME, script);
  });

  it("indeer without readonly modifier should produce violations", (): void => {
    const script : string = `
      let foo: {[key: string]: number};
    `;
    TestHelper.assertViolations(RULE_NAME, script, [
      {
        "failure": "Indexers must be have readonly modifier.",
        "name": "file.ts",
        "ruleName": "readonly-indexer",
        "startPosition": {
          "line": 2,
          "character": 17
        }
      },
    ]);
  });

});
