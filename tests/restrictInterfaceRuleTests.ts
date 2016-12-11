import * as TestHelper from "./TestHelper";

describe('restrictInterfaceRule', (): void => {

  const RULE_NAME: string = 'restrict-interface';

  it('properties should not produce violations', (): void => {
    const script : string = `
      interface Foo {
        bar: string,
      }
    `;
    TestHelper.assertNoViolation(RULE_NAME, script);
  });

  it('function types should not produce violations', (): void => {
    const script : string = `
      interface Foo {
        goo: () => number,
      }
    `;
    TestHelper.assertNoViolation(RULE_NAME, script);
  });

  it('methods should not produce violations', (): void => {
    const script : string = `
      interface Foo {
        zoo(): number,
      }
    `;
    TestHelper.assertNoViolation(RULE_NAME, script);
  });

  it('indexers should not produce violations', (): void => {
    const script : string = `
      interface Foo {
        bar: {[key:string]: string},
      }
    `;
    TestHelper.assertNoViolation(RULE_NAME, script);
  });

  it('should produce violations', (): void => {
    const script : string = `
      interface Foo {
        bar: Array<string>,
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
