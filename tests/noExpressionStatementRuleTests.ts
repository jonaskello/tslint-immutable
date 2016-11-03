import TestHelper = require('./TestHelper');
var x = require("../src/noExpressionStatementRule");

describe('noThisRule', ():void => {

  const RULE_NAME:string = 'no-expression-statement';

  it('should not produce violations', ():void => {
    const script:string = `
            let x = 0;
        `;

    TestHelper.assertViolations(RULE_NAME, script, []);
  });

  it('should produce violations ', ():void => {
    const script:string = `
            x.push(1);
        `;
    TestHelper.assertViolations(RULE_NAME, script, [
      {
        "failure": "Using expressions to cause side-effects not allowed.",
        "name": "file.ts",
        "ruleName": "no-expression-statement",
        "startPosition": {
          "line": 2,
          "character": 13
        }
      }
    ]);
  });

});
