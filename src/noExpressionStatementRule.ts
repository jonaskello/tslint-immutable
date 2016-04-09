import * as ts from "typescript";
import * as Lint from "tslint/lib/lint";

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = "Using expressions to cause side-effects not allowed.";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const noExpressionStatementWalker = new NoExpressionStatementWalker(sourceFile, this.getOptions());
    return this.applyWithWalker(noExpressionStatementWalker);
  }
}

class NoExpressionStatementWalker extends Lint.RuleWalker {

  public visitNode(node: ts.Node) {
    if (node && node.kind === ts.SyntaxKind.ExpressionStatement) {
      this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
    }
    super.visitNode(node);
  }

}
