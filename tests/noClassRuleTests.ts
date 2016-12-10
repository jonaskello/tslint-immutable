import * as TestHelper from "./TestHelper";

describe('noClassRule', (): void => {

  const RULE_NAME: string = 'no-class';

  it('using class should produce violations', (): void => {
    const script : string = `class Foo {}`;
    TestHelper.assertViolations(RULE_NAME, script, [
      {
        "failure": "Unexpected class, use functions not classes.",
        "name": "file.ts",
        "ruleName": "no-class",
        "startPosition": {
          "line": 1,
          "character": 1
        }
      }
    ]);
  });

});
