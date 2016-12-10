import * as ts from "typescript";
import * as Lint from "tslint";

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = "Only readonly properties allowed in interfaces.";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const walker = new ReadonlyInterfaceWalker(sourceFile, this.getOptions());
    return this.applyWithWalker(walker);
  }
}

class ReadonlyInterfaceWalker extends Lint.RuleWalker {

  public visitInterfaceDeclaration(node: ts.InterfaceDeclaration): void {
    for (const member of node.members) {
      // if (!(member.flags & ts.NodeFlags.Readonly)) {
      if (!(member.modifiers && member.modifiers.filter((m) => m.kind & ts.ModifierFlags.Readonly).length > 0)) {
        this.addFailure(this.createFailure(member.getStart(), member.getWidth(), Rule.FAILURE_STRING));
      }
    }
    super.visitInterfaceDeclaration(node);
  }

  protected visitIndexSignatureDeclaration(node: ts.IndexSignatureDeclaration): void {
    // if (!(node.flags & ts.NodeFlags.Readonly)) {
    if (!(node.modifiers && node.modifiers.filter((m) => m.kind & ts.ModifierFlags.Readonly).length > 0)) {
      this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
    }
    super.visitIndexSignatureDeclaration(node);
  }
}
