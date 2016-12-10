import * as TestHelper from "./TestHelper";

describe('noThisRule', (): void => {

  const RULE_NAME: string = 'no-this';

  it('should not produce violations', (): void => {
    const script: string = `
            let x = 0;
        `;

    TestHelper.assertViolations(RULE_NAME, script, []);
  });

  it('should produce violations ', (): void => {
    const script: string = `
            this.x = 0;
        `;
    TestHelper.assertViolations(RULE_NAME, script, [
      {
        "failure": "Unexpected this, use functions not classes.",
        "name": "file.ts",
        "ruleName": "no-this",
        "startPosition": {
          "line": 2,
          "character": 13
        }
      }
    ]);
  });

});
