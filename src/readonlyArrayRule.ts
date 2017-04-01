import * as ts from "typescript";
import * as Lint from "tslint";

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = "Only ReadonlyArray allowed.";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const walker = new ReadonlyArrayWalker(sourceFile, this.getOptions());
    return this.applyWithWalker(walker);
  }
}

class ReadonlyArrayWalker extends Lint.RuleWalker {

  protected visitTypeReference(node: ts.TypeReferenceNode): void {
    super.visitTypeReference(node);
    if (node.typeName.getText() === "Array") {
      this.addFailure(this.createFailure(node.typeName.getStart(), node.typeName.getWidth(), Rule.FAILURE_STRING));
    }
  }

  protected visitArrayLiteralExpression(node: ts.ArrayLiteralExpression): void {
    super.visitArrayLiteralExpression(node);
    // If the array literal is used in a variable declaration, the variable
    // must have a type spcecified, otherwise it will implicitly be of mutable Array type
    if (node.parent && node.parent.kind === ts.SyntaxKind.VariableDeclaration) {
      const variableDeclarationNode = node.parent as ts.VariableDeclaration;
      const typeNode: any = variableDeclarationNode.type;
      if (!variableDeclarationNode.type) {
        this.addFailure(this.createFailure(variableDeclarationNode.name.getStart(), variableDeclarationNode.name.getWidth(), Rule.FAILURE_STRING));
      }
    }
  }

  protected visitTypeLiteral(node: ts.TypeLiteralNode): void {
    super.visitTypeLiteral(node);
    // if (node.kind === ts.SyntaxKind.ArrayType) {
    if (node.kind as number === ts.SyntaxKind.ArrayType) {
      this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
    }
  }
}
