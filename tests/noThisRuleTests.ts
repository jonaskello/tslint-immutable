import TestHelper = require('./TestHelper');

describe('noThisRule', ():void => {

  var RULE_NAME:string = 'no-this';

  it('should not produce violations', ():void => {
    var script:string = `
            let x = 0;
        `;

    TestHelper.assertViolations(RULE_NAME, script, []);
  });

  it('should produce violations ', ():void => {
    var script:string = `
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
