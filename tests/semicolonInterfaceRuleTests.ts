import * as TestHelper from "./TestHelper";

describe('semicolonInterfaceRule', (): void => {

  const RULE_NAME: string = 'semicolon-interface';

  it('should not produce violations', (): void => {
    const script : string = `
        interface Foo {
          bar: string,
          zoo: number,
        }
    `;

    TestHelper.assertNoViolation(RULE_NAME, script);
  });

  it('should produce violations', (): void => {
    const script : string = `
        interface Foo {
          bar: string;
        }
    `;
    TestHelper.assertViolations(RULE_NAME, script, [
      {
        "failure": "Use comma instead of semicolon in interfaces.",
        "name": "file.ts",
        "ruleName": "semicolon-interface",
        "startPosition": {
          "line": 3,
          "character": 11
        }
      }
    ]);
  });

});
