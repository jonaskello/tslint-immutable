import * as ts from "typescript";
import * as Lint from "tslint";

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = "Indexers must be have readonly modifier.";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const walker = new ReadonlyIndexerWalker(sourceFile, this.getOptions());
    return this.applyWithWalker(walker);
  }
}

class ReadonlyIndexerWalker extends Lint.RuleWalker {
  protected visitIndexSignatureDeclaration(node: ts.IndexSignatureDeclaration): void {
    if (!(node.modifiers && node.modifiers.filter((m) => m.kind === ts.SyntaxKind.ReadonlyKeyword).length > 0)) {
      this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
    }
    super.visitIndexSignatureDeclaration(node);
  }
}
