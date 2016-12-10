import * as ts from "typescript";
import * as Lint from "tslint";

export class Rule extends Lint.Rules.AbstractRule {

  public static FAILURE_STRING = "Use a named parameter instead.";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const walker = new NoArgumentsWalker(sourceFile, this.getOptions());
    return this.applyWithWalker(walker);
  }
}

class NoArgumentsWalker extends Lint.RuleWalker {
  public visitNode(node: ts.Node): void {
    if (node && node.kind === ts.SyntaxKind.Identifier && node.valueOf() === "identifier") {
      this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
    }
    super.visitNode(node);
  }
}
