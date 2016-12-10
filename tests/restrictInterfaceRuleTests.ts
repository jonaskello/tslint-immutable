import * as TestHelper from "./TestHelper";

describe('restrictInterfaceRule', (): void => {

  const RULE_NAME: string = 'restrict-interface';

  it('should not produce violations', (): void => {
    const script : string = `
      interface Foo {
        bar: string,
        zoo(): number,
      }
    `;
    TestHelper.assertNoViolation(RULE_NAME, script);
  });

  it('should produce violations', (): void => {
    const script : string = `
      interface Foo {
        bar: string,
        zoo(): number,
      }
    `;
    TestHelper.assertViolations(RULE_NAME, script, [
      {
        "failure": "Only property, index, or function types allowed in interfaces.",
        "name": "file.ts",
        "ruleName": "restrict-interface",
        "startPosition": {
          "line": 4,
          "character": 9
        }
      }
    ]);
  });

});
