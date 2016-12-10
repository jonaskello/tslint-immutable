import * as TestHelper from "./TestHelper";

describe('noNewRule', (): void => {

  const RULE_NAME: string = 'no-new';

  it('should not produce violations', (): void => {
    const script: string = `
            let x = 0;
        `;

    TestHelper.assertNoViolation(RULE_NAME, script);
  });

  it('should produce violations ', (): void => {
    const script: string = `
            let x = new Foo();
        `;
    TestHelper.assertViolations(RULE_NAME, script, [
      {
        "failure": "Unexpected new, use functions not classes.",
        "name": "file.ts",
        "ruleName": "no-new",
        "startPosition": {
          "line": 2,
          "character": 21
        }
      }
    ]);
  });

});
