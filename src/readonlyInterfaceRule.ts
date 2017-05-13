import * as ts from "typescript";
import * as Lint from "tslint";
import * as Shared from "./readonly-shared";

export class Rule extends Lint.Rules.AbstractRule {
  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithFunction(
      sourceFile,
      (ctx: Lint.WalkContext<Shared.Options>) => Shared.walk(ctx, checkNode, "Interface members must have readonly modifier."),
      Shared.parseOptions(this.ruleArguments));
  }
}

function checkNode(node: ts.Node, ctx: Lint.WalkContext<Shared.Options>): ReadonlyArray<Shared.InvalidNode> {
  return checkInterfaceDeclaration(node, ctx);
}

function checkInterfaceDeclaration(node: ts.Node, ctx: Lint.WalkContext<Shared.Options>): ReadonlyArray<Shared.InvalidNode> {

  if (node.kind === ts.SyntaxKind.InterfaceDeclaration) {
    const interfaceDeclarationNode = node as ts.InterfaceDeclaration;
    const invalidNodes: Array<Shared.InvalidNode> = [];
    for (const member of interfaceDeclarationNode.members) {
      // readonly modifier is only allowed for PropertySignature and IndexSignature
      if (member.kind === ts.SyntaxKind.PropertySignature || member.kind === ts.SyntaxKind.IndexSignature) {
        if (!(member.modifiers && member.modifiers.filter((m) => m.kind === ts.SyntaxKind.ReadonlyKeyword).length > 0)) {
          const length = member.getWidth(ctx.sourceFile);
          const memberName = member.name;
          invalidNodes.push(Shared.createInvalidNode(member, new Lint.Replacement(node.end - length, length, `readonly ${memberName}`)));
        }
      }
    }
    return invalidNodes;
  }
  return [];
}
