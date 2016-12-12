import * as ts from "typescript";
import * as Lint from "tslint";

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = "Interface members must have readonly modifier.";
  public static FAILURE_STRING_ARRAY = "Interface members of array type must be ReadonlyArray.";

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

      // console.log("member.type", (member as any).type);
      //
      // if (member.kind === ts.SyntaxKind.ArrayType) {
      //   this.addFailure(this.createFailure(member.getStart(), member.getWidth(), Rule.FAILURE_STRING_ARRAY));
      // }

    }
    super.visitInterfaceDeclaration(node);
  }
}
