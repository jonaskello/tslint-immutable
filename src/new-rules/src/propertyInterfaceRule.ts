import * as ts from "typescript";
import * as Lint from "tslint";

const allowedKinds: number[] = [
  ts.SyntaxKind.PropertySignature,
  ts.SyntaxKind.IndexSignature,
  ts.SyntaxKind.FunctionType,
];

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = "Only property, index, or function types allowed in interfaces.";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const walker = new PropertyInterfaceWalker(sourceFile, this.getOptions());
    return this.applyWithWalker(walker);
  }
}

export class RuleSameKind extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = "Only the same kind of properties allowed in interfaces.";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const walker = new PropertyInterfaceWalker(sourceFile, this.getOptions());
    return this.applyWithWalker(walker);
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
    if (lastItem !== undefined && lastItem !== item) { return i; }
    i++;
    lastItem = item;
  }
  return -1;
}

/**
 * Return the index of the first item in list 'a' that isn't
 * found in list 'b'.
 *
 */
function unionCheckIndex(a: number[], b: number[]): number {
  let i = 0;
  for(let item of a) {
    if (b.indexOf(item) === -1) { return i; }
    i++;
  }
  return -1;
}

class PropertyInterfaceWalker extends Lint.RuleWalker {
  public visitInterfaceDeclaration(node: ts.InterfaceDeclaration) {
    // Extract 'kind' from all members to a list of numbers.
    const memberKinds: number[] = node.members.map((m) => m.kind);

    // Check so all members of a node have the same kind,
    const unUniqueMember: number = uniqIndex(memberKinds);
    if (unUniqueMember !== -1) {
      this.addFailure(this.createFailure(node.members[unUniqueMember].getStart(), node.members[unUniqueMember].getWidth(), RuleSameKind.FAILURE_STRING));
    }

    // Check so all members of a node have an approved kind.
    const failedMember: number = unionCheckIndex(memberKinds, allowedKinds);
    if (failedMember !== -1) {
      this.addFailure(this.createFailure(node.members[failedMember].getStart(), node.members[failedMember].getWidth(), Rule.FAILURE_STRING));
    }

    super.visitInterfaceDeclaration(node);
  }
}
