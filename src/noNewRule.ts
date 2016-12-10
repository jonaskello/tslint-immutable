import * as ts from "typescript";
import * as Lint from "tslint";

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = "Unexpected new, use functions not classes.";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const noNewKeywordWalker = new NoNewWalker(sourceFile, this.getOptions());
    return this.applyWithWalker(noNewKeywordWalker);
  }
}

class NoNewWalker extends Lint.RuleWalker {

  public visitNode(node: ts.Node): void {
    if (node && node.kind === ts.SyntaxKind.NewKeyword || node.kind === ts.SyntaxKind.NewExpression) {
      this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
    }
    super.visitNode(node);
  }

}
