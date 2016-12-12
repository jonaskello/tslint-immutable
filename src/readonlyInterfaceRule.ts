import * as ts from "typescript";
import * as Lint from "tslint";

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = "Interface members must have readonly modifier.";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const walker = new ReadonlyInterfaceWalker(sourceFile, this.getOptions());
    return this.applyWithWalker(walker);
  }
}

class ReadonlyInterfaceWalker extends Lint.RuleWalker {
  public visitInterfaceDeclaration(node: ts.InterfaceDeclaration): void {
    for (const member of node.members) {
      if (!(member.modifiers && member.modifiers.filter((m) => m.kind === ts.SyntaxKind.ReadonlyKeyword).length > 0)) {
        this.addFailure(this.createFailure(member.getStart(), member.getWidth(), Rule.FAILURE_STRING));
      }
    }
    super.visitInterfaceDeclaration(node);
  }
}
