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
        "failure": "Unexpected let, use const.",
        "name": "file.ts",
        "ruleName": "no-let",
        "startPosition": {
          "line": 2,
          "character": 13
        }
      }
    ]);
  });

  it('for let loop should produce violations ', (): void => {
    const script : string = `
            for(let x = 0; x < 1;x++);
        `;
    TestHelper.assertViolations(RULE_NAME, script, [
      {
        "failure": "Unexpected let, use const.",
        "name": "file.ts",
        "ruleName": "no-let",
        "startPosition": {
          "line": 2,
          "character": 17
        }
      }
    ]);
  });

});
