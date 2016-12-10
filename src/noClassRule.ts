import * as ts from "typescript";
import * as Lint from "tslint";

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = "Unexpected class, use functions not classes.";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const noClassKeywordWalker = new NoClassWalker(sourceFile, this.getOptions());
    return this.applyWithWalker(noClassKeywordWalker);
  }
}

class NoClassWalker extends Lint.RuleWalker {

  public visitNode(node: ts.Node): void {

    if (node && node.kind === ts.SyntaxKind.ClassKeyword || node.kind === ts.SyntaxKind.ClassDeclaration) {
      this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
    }
    super.visitNode(node);
  }

}
