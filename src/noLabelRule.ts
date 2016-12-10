import * as ts from "typescript";
import * as Lint from "tslint";

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = "Do not use labels.";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const walker = new NoLabelsWalker(sourceFile, this.getOptions());
    return this.applyWithWalker(walker);
  }
}

class NoLabelsWalker extends Lint.RuleWalker {

  public visitNode(node: ts.Node): void {
    if (node && node.kind === ts.SyntaxKind.LabeledStatement) {
      this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
    }
    super.visitNode(node);
  }

}
