import * as Lint from 'tslint';
import * as fs from 'fs';
import * as chai from 'chai';

export interface FailurePosition {
  character: number;
  line: number;
  position?: number;
}
export interface ExpectedFailure {
  ruleName: string;
  name: string;
  failure: string;
  endPosition?: FailurePosition;
  startPosition: FailurePosition;
}

export function assertNoViolation(ruleName: string, inputFileOrScript: string) {
  runRuleAndEnforceAssertions(ruleName, null, inputFileOrScript, []);
}

export function assertViolations(ruleName: string, inputFileOrScript: string, expectedFailures: ExpectedFailure[]) {
  runRuleAndEnforceAssertions(ruleName, null, inputFileOrScript, expectedFailures);
}

export function assertNoViolationWithOptions(ruleName: string, options: any[], inputFileOrScript: string) {
  runRuleAndEnforceAssertions(ruleName, options, inputFileOrScript, []);
}

export function assertViolationsWithOptions(ruleName: string, options: any[], inputFileOrScript: string,
                                            expectedFailures: ExpectedFailure[]) {
  runRuleAndEnforceAssertions(ruleName, options, inputFileOrScript, expectedFailures);
}

function runRuleAndEnforceAssertions(ruleName: string, userOptions: string[], inputFileOrScript: string,
                                     expectedFailures: ExpectedFailure[]) {

  const configuration = {
    rules: {}
  };
  if (userOptions && userOptions.length > 0) {
    //options like `[4, 'something', false]` were passed, so prepend `true` to make the array like `[true, 4, 'something', false]`
    configuration.rules[ruleName] = (<any[]>[true]).concat(userOptions);
  } else {
    configuration.rules[ruleName] = true;
  }

  const options: Lint.ILinterOptions = {
    formatter: 'json',
    rulesDirectory: 'js_out_test/src/',
    fix: false
  };

  const linter = new Lint.Linter(options);
  if (inputFileOrScript.match(/.*\.ts/)) {
    const contents = fs.readFileSync(inputFileOrScript, 'utf8');
    linter.lint(inputFileOrScript, contents, configuration);
  } else {
    linter.lint('file.ts', inputFileOrScript, configuration);
  }

  const result = linter.getResult();

  const actualFailures: ExpectedFailure[] = JSON.parse(result.output);

  // All the information we need is line and character of start position. For JSON comparison
  // to work, we will delete the information that we are not interested in from both actual and
  // expected failures.
  actualFailures.forEach((actual: ExpectedFailure): void => {
    delete actual.startPosition.position;
    delete actual.endPosition;
    // Editors start counting lines and characters from 1, but tslint does it from 0.
    // To make thing easier to debug, aling to editor values.
    actual.startPosition.line = actual.startPosition.line + 1;
    actual.startPosition.character = actual.startPosition.character + 1;
  });
  expectedFailures.forEach((expected: ExpectedFailure): void => {
    delete expected.startPosition.position;
    delete expected.endPosition;
  });

  const errorMessage = 'Wrong # of failures: \n' + JSON.stringify(actualFailures, null, 2);
  chai.assert.equal(actualFailures.length, expectedFailures.length, errorMessage);

  expectedFailures.forEach((expected: ExpectedFailure, index: number): void => {
    const actual = actualFailures[index];
    chai.assert.deepEqual(actual, expected);
  });
}
