import * as ts from "typescript";
import * as Lint from "tslint";

const OPTION_IGNORE_PREFIX = "ignore-prefix";

export interface Options {
  readonly ignorePrefix: string | string[] | undefined,
}

function parseOptions(options: any[]): Options { //tslint:disable-line
  let ignorePrefix: string | undefined;
  for (const o of options) {
    if (typeof o === "object" && o[OPTION_IGNORE_PREFIX] !== null) { //tslint:disable-line
      ignorePrefix = o[OPTION_IGNORE_PREFIX];
      break;
    }
  }
  return { ignorePrefix };
}

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = "Modifying properties of existing object not allowed.";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const noObjectMutationWalker = new NoObjectMutationWalker(sourceFile, this.getOptions());
    return this.applyWithWalker(noObjectMutationWalker);
  }
}

const objPropAccessors: ReadonlyArray<ts.SyntaxKind> = [
  ts.SyntaxKind.ElementAccessExpression,
  ts.SyntaxKind.PropertyAccessExpression
];

const forbidObjPropOnLeftSideOf: ReadonlyArray<ts.SyntaxKind> = [
  ts.SyntaxKind.EqualsToken,
  ts.SyntaxKind.PlusEqualsToken,
  ts.SyntaxKind.MinusEqualsToken,
  ts.SyntaxKind.AsteriskEqualsToken,
  ts.SyntaxKind.AsteriskAsteriskEqualsToken,
  ts.SyntaxKind.SlashEqualsToken,
  ts.SyntaxKind.PercentEqualsToken,
  ts.SyntaxKind.LessThanLessThanEqualsToken,
  ts.SyntaxKind.GreaterThanGreaterThanEqualsToken,
  ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken,
  ts.SyntaxKind.AmpersandEqualsToken,
  ts.SyntaxKind.BarEqualsToken,
  ts.SyntaxKind.CaretEqualsToken
];

const forbidUnaryOps: ReadonlyArray<ts.SyntaxKind> = [
  ts.SyntaxKind.PlusPlusToken,
  ts.SyntaxKind.MinusMinusToken
];

class NoObjectMutationWalker extends Lint.RuleWalker {

  ignorePrefix: string | string[] | undefined;

  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions) {
    super(sourceFile, options);
    Object.assign(this, parseOptions(options.ruleArguments));
  }

  public visitNode(node: ts.Node): void {
    // No assignment with object.property on the left
    if (node && node.kind === ts.SyntaxKind.BinaryExpression) {
      const binExp = node as ts.BinaryExpression;
      if (objPropAccessors.some((k) => k === binExp.left.kind) &&
          forbidObjPropOnLeftSideOf.some((k) => k === binExp.operatorToken.kind) &&
          !this.isIgnored(binExp.getText(this.getSourceFile()))
         ) {
        this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
      }
    }

    // No deleting object properties
    if (node && node.kind === ts.SyntaxKind.DeleteExpression) {
      const delExp = node as ts.DeleteExpression;
      if (objPropAccessors.some((k) => k === delExp.expression.kind) &&
          !this.isIgnored(delExp.expression.getText(this.getSourceFile()))
         ) {
        this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
      }
    }

    // No prefix inc/dec
    if (node && node.kind === ts.SyntaxKind.PrefixUnaryExpression) {
      const preExp = node as ts.PrefixUnaryExpression;
      if (objPropAccessors.some((k) => k === preExp.operand.kind) &&
          forbidUnaryOps.some((o) => o === preExp.operator) &&
          !this.isIgnored(preExp.operand.getText(this.getSourceFile()))
         ) {
        this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
      }
    }

    // No postfix inc/dec
    if (node && node.kind === ts.SyntaxKind.PostfixUnaryExpression) {
      const postExp = node as ts.PostfixUnaryExpression;
      if (objPropAccessors.some((k) => k === postExp.operand.kind) &&
          forbidUnaryOps.some((o) => o === postExp.operator) &&
          !this.isIgnored(postExp.getText(this.getSourceFile()))
         ) {
        this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
      }
    }

    super.visitNode(node);
  }

  private isIgnored(text: string): boolean {
    if (!this.ignorePrefix) {
      return false;
    }
    if (Array.isArray(this.ignorePrefix)) {
      if (this.ignorePrefix.find((pfx) => text.indexOf(pfx) === 0)) {
        return true;
      }
    } else {
      if (text.indexOf(this.ignorePrefix) === 0) {
        return true;
      }
    }
    return false;
  }
}
