import * as ts from "typescript";
import * as Lint from "tslint";

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = "Only the same kind of members allowed in interfaces.";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const walker = new PropertyInterfaceWalker(sourceFile, this.getOptions());
    return this.applyWithWalker(walker);
  }
}

class PropertyInterfaceWalker extends Lint.RuleWalker {
  public visitInterfaceDeclaration(node: ts.InterfaceDeclaration): void {
    // Extract 'kind' from all members to a list of numbers.
    const memberKinds: number[] = node.members.map(m => m.kind);

    // Check so all members of a node have the same kind,
    const unUniqueMember: number = uniqIndex(memberKinds);
    if (unUniqueMember !== -1) {
      this.addFailure(
        this.createFailure(
          node.members[unUniqueMember].getStart(),
          node.members[unUniqueMember].getWidth(),
          Rule.FAILURE_STRING
        )
      );
    }

    super.visitInterfaceDeclaration(node);
  }
}

/**
 * Return the index of the first non unique item.
 *
 */
function uniqIndex(list: number[]): number {
  let i = 0;
  let lastItem: number | undefined = undefined;
  for (let item of list) {
    if (lastItem !== undefined && lastItem !== item) {
      return i;
    }
    i++;
    lastItem = item;
  }
  return -1;
}
