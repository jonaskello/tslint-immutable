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

  public visitNode(node: ts.Node): void {
    if (node && node.kind === ts.SyntaxKind.ExpressionStatement) {
      const children = node.getChildren();
      if (children.every((n: ts.Node) => n.kind !== ts.SyntaxKind.YieldExpression)) {
        this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
      }
    }
    super.visitNode(node);
  }

}
