import * as TestHelper from "./TestHelper";

describe('noArgumentsRule', (): void => {

  const RULE_NAME: string = 'no-arguments';

  it('should not produce violations', (): void => {
    const script : string = `
            var x = 0;
        `;

    TestHelper.assertNoViolation(RULE_NAME, script);
  });

  it('arguments should produce violations ', (): void => {
    const script : string = `
            arguments[0];
        `;
    TestHelper.assertViolations(RULE_NAME, script, [
      {
        "failure": "Use a named parameter instead.",
        "name": "file.ts",
        "ruleName": "no-let",
        "startPosition": {
          "line": 2,
          "character": 13
        }
      }
    ]);
  });

});
