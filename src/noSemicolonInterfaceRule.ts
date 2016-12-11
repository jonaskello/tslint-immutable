import * as ts from "typescript";
import * as Lint from "tslint";

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = "Use comma instead of semicolon in interfaces.";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const walker = new SemicolonInterfaceWalker(sourceFile, this.getOptions());
    return this.applyWithWalker(walker);
  }
}

class SemicolonInterfaceWalker extends Lint.RuleWalker {

  public visitInterfaceDeclaration(node: ts.InterfaceDeclaration) {
    const sourceFile = this.getSourceFile();
    for (const member of node.members) {
      const children = member.getChildren(sourceFile);
      const hasSemicolon = children.some((child) => child.kind === ts.SyntaxKind.SemicolonToken);
      if (hasSemicolon) {
        this.addFailure(this.createFailure(member.getStart(), member.getWidth(), Rule.FAILURE_STRING));
      }
    }
    super.visitInterfaceDeclaration(node);
  }

}
