import * as ts from "typescript";
import * as Lint from "tslint";

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = "Only ReadonlyArray allowed.";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk);
  }

}

function walk(ctx: Lint.WalkContext<void>): void {
  return ts.forEachChild(ctx.sourceFile, cb);
  function cb(node: ts.Node): void {
    if (node.kind === ts.SyntaxKind.TypeReference && isInvalidArrayTypeReference(node as ts.TypeReferenceNode)) {
      return ctx.addFailureAtNode(node, Rule.FAILURE_STRING);
    }
    if (node.kind === ts.SyntaxKind.ArrayLiteralExpression && isInvalidArrayLiteralExpression(node as ts.ArrayLiteralExpression)) {
      const variableDeclarationNode = node.parent as ts.VariableDeclaration;
      ctx.addFailureAt(variableDeclarationNode.name.getStart(), variableDeclarationNode.name.getWidth(), Rule.FAILURE_STRING);
    }
    return ts.forEachChild(node, cb);
  }
}

function isInvalidArrayTypeReference(node: ts.TypeReferenceNode): boolean {
  if (node.typeName.getText() === "Array") {
    return true;
  }
  return false;
}

function isInvalidArrayLiteralExpression(node: ts.ArrayLiteralExpression): boolean {
  // If the array literal is used in a variable declaration, the variable
  // must have a type spcecified, otherwise it will implicitly be of mutable Array type
  if (node.parent && node.parent.kind === ts.SyntaxKind.VariableDeclaration) {
    const variableDeclarationNode = node.parent as ts.VariableDeclaration;
    if (!variableDeclarationNode.type) {
      return true;
    }
  }
  return false;
}
