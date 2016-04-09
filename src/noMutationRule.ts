import * as ts from "typescript";
import * as Lint from "tslint/lib/lint";

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = "No object mutation allowed.";

  public apply(sourceFile:ts.SourceFile):Lint.RuleFailure[] {
    const noMutationWalker = new NoMutationWalker(sourceFile, this.getOptions());
    return this.applyWithWalker(noMutationWalker);
  }
}

class NoMutationWalker extends Lint.RuleWalker {

  public visitNode(node:ts.Node) {
    if (node && node.kind === ts.SyntaxKind.BinaryExpression
      && node.getChildCount() >= 3
      && node.getChildAt(0).kind === ts.SyntaxKind.PropertyAccessExpression
      && node.getChildAt(1).kind === ts.SyntaxKind.FirstAssignment) {
      this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
    }

    super.visitNode(node);
  }

}
