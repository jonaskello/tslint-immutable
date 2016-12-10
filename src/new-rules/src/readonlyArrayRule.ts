import * as ts from "typescript";
import * as Lint from "tslint";

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = "Only ReadonlyArray allowed.";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const walker = new ReadonlyArrayInterfaceWalker(sourceFile, this.getOptions());
    return this.applyWithWalker(walker);
  }
}

class ReadonlyArrayInterfaceWalker extends Lint.RuleWalker {
  protected visitTypeReference(node: ts.TypeReferenceNode): void {
    super.visitTypeReference(node);
    if (node.typeName.getText() === "Array") {
      this.addFailure(this.createFailure(node.typeName.getStart(), node.typeName.getWidth(), Rule.FAILURE_STRING));
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
