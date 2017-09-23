import * as ts from "typescript";
import * as Lint from "tslint";

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = "Method signature is mutable, use property signature with readonly modifier instead.";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const noThisKeywordWalker = new NoMethodSignatureWalker(
      sourceFile,
      this.getOptions()
    );
    return this.applyWithWalker(noThisKeywordWalker);
  }
}

class NoMethodSignatureWalker extends Lint.RuleWalker {
  public visitNode(node: ts.Node): void {
    if (node && node.kind === ts.SyntaxKind.MethodSignature) {
      this.addFailureAtNode(node, Rule.FAILURE_STRING);
    }
    super.visitNode(node);
  }
}
