import * as ts from "typescript";
import * as Lint from "tslint";

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = "Unexpected this, use functions not classes.";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const noThisKeywordWalker = new NoThisWalker(sourceFile, this.getOptions());
    return this.applyWithWalker(noThisKeywordWalker);
  }
}

class NoThisWalker extends Lint.RuleWalker {

  public visitNode(node: ts.Node) {
    if (node && node.kind === ts.SyntaxKind.ThisKeyword) {
      this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
    }
    super.visitNode(node);
  }

}
