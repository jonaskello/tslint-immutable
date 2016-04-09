import TestHelper = require('./TestHelper');

describe('noLetRule', (): void => {

  var RULE_NAME: string = 'no-let';

  it('should not produce violations', (): void => {
    var script : string = `
            var x = 0;
        `;

    TestHelper.assertViolations(RULE_NAME, script, []);
  });

  it('variable declaration should produce violations ', (): void => {
    var script : string = `
            let x = 0;
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
    var script : string = `
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
