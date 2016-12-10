import * as TestHelper from "./TestHelper";

describe('noMixedInterfaceRuleTests', (): void => {

  const RULE_NAME: string = 'no-mixed-interface';

  it('only properties should not produce violations', (): void => {
    const script : string = `
      interface Foo {
        bar: string,
        zoo: number,
      }
    `;
    TestHelper.assertNoViolation(RULE_NAME, script);
  });

  it('only functions should not produce violations', (): void => {
    const script : string = `
      interface Foo {
        bar(): string,
        zoo(): number,
      }
    `;
    TestHelper.assertNoViolation(RULE_NAME, script);
  });

  it('only indexer should not produce violations', (): void => {
    const script : string = `
      interface Foo {
        [key: string]: string,
      }
    `;
    TestHelper.assertNoViolation(RULE_NAME, script);
  });

  it('mixing properties and functions should produce violations', (): void => {
    const script : string = `
      interface Foo {
        bar: string,
        zoo(): number,
      }
    `;
    TestHelper.assertViolations(RULE_NAME, script, [
      {
        "failure": "Only the same kind of members allowed in interfaces.",
        "name": "file.ts",
        "ruleName": "no-mixed-interface",
        "startPosition": {
          "line": 4,
          "character": 9
        }
      }
    ]);
  });

});
