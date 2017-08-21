import * as ts from "typescript";
import * as Lint from "tslint";

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

  public visitNode(node: ts.Node): void {
    // No assignment with object.property on the left
    if (node && node.kind === ts.SyntaxKind.BinaryExpression) {
      const binExp = node as ts.BinaryExpression;
      if (objPropAccessors.some(k => k === binExp.left.kind) &&
          forbidObjPropOnLeftSideOf.some(k => k === binExp.operatorToken.kind)) {
        this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
      }
    }

    // No deleting object properties
    if (node && node.kind === ts.SyntaxKind.DeleteExpression) {
      const delExp = node as ts.DeleteExpression;
      if (objPropAccessors.some(k => k === delExp.expression.kind)) {
        this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
      }
    }

    // No prefix inc/dec
    if (node && node.kind === ts.SyntaxKind.PrefixUnaryExpression) {
      const preExp = node as ts.PrefixUnaryExpression;
      if (objPropAccessors.some(k => k === preExp.operand.kind) &&
          forbidUnaryOps.some(o => o === preExp.operator)) {
        this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
      }
    }

    // No postfix inc/dec
    if (node && node.kind === ts.SyntaxKind.PostfixUnaryExpression) {
      const postExp = node as ts.PostfixUnaryExpression;
      if (objPropAccessors.some(k => k === postExp.operand.kind) &&
         forbidUnaryOps.some(o => o === postExp.operator)) {
        this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
      }
    }

    super.visitNode(node);
  }

}
