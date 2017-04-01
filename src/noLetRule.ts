import * as ts from "typescript";
import * as Lint from "tslint";

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = "Unexpected let, use const.";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const noLetWalker = new NoLetKeywordWalker(sourceFile, this.getOptions());
    return this.applyWithWalker(noLetWalker);
  }
}

class NoLetKeywordWalker extends Lint.RuleWalker {
  public visitVariableStatement(node: ts.VariableStatement) {
    if (Lint.isNodeFlagSet(node.declarationList, ts.NodeFlags.Let)) {
      this.addFailure(this.createFailure(node.getStart(), "let".length, Rule.FAILURE_STRING));
    }

    super.visitVariableStatement(node);
  }

  public visitForStatement(node: ts.ForStatement) {
    this.handleInitializerNode(node.initializer!);
    super.visitForStatement(node);
  }

  public visitForInStatement(node: ts.ForInStatement) {
    this.handleInitializerNode(node.initializer);
    super.visitForInStatement(node);
  }

  public visitForOfStatement(node: ts.ForOfStatement) {
    this.handleInitializerNode(node.initializer);
    super.visitForOfStatement(node);
  }

  private handleInitializerNode(node: ts.VariableDeclarationList | ts.Expression) {
    if (node && node.kind === ts.SyntaxKind.VariableDeclarationList &&
      (Lint.isNodeFlagSet(node, ts.NodeFlags.Let))) {
      this.addFailure(this.createFailure(node.getStart(), "let".length, Rule.FAILURE_STRING));
    }
  }
}
