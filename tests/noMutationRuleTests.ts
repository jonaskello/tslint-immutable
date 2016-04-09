var ts = require("ntypescript");
//import * as ts from "ntypescript";

import TestHelper = require('./TestHelper');

describe('noMutationRule', ():void => {

  var RULE_NAME:string = 'no-mutation';

  it('should not produce violations', ():void => {
    var script:string = `
            let x = y.z;
        `;

    TestHelper.assertViolations(RULE_NAME, script, []);
  });

  it('should produce violations ', ():void => {
    var script:string = `
            x.y = 0;
        `;
    TestHelper.assertViolations(RULE_NAME, script, [
      {
        "failure": "No object mutation allowed.",
        "name": "file.ts",
        "ruleName": "no-mutation",
        "startPosition": {
          "line": 2,
          "character": 13
        }
      }
    ]);
  });

/*
  it('should work', ():void => {

    function printAllChildren(node:ts.Node, depth = 0) {
      console.log(new Array(depth + 1).join('----'),
        ts.syntaxKindToName(node.kind),
        node.flags,
        node.pos, node.end);
      depth++;
      node.getChildren().forEach(c => printAllChildren(c, depth));
    }

    var sourceCode = `
      x.foo = 3;
      `.trim();

    var sourceFile = ts.createSourceFile('foo.ts', sourceCode, ts.ScriptTarget.ES5, true);
    printAllChildren(sourceFile);

  });
*/

});
