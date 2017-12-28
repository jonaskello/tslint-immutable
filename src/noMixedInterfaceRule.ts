import * as ts from "typescript";
import * as Lint from "tslint";
import * as Shared from "./shared-readonly";
import { createInvalidNode, CheckNodeResult, walk } from "./shared";

const FAILURE_STRING = "Only the same kind of members allowed in interfaces.";

export class Rule extends Lint.Rules.AbstractRule {
  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithFunction(
      sourceFile,
      (ctx: Lint.WalkContext<Shared.Options>) =>
        walk(ctx, Shared.checkNodeWithIgnore(checkNode), FAILURE_STRING),
      Shared.parseOptions(this.ruleArguments)
    );
  }
}

function checkNode(
  node: ts.Node,
  _ctx: Lint.WalkContext<Shared.Options>
): CheckNodeResult {
  const invalidNodes = [];
  if (node.kind === ts.SyntaxKind.InterfaceDeclaration) {
    const interfaceDeclaration = node as ts.InterfaceDeclaration;
    let prevMemberKind: number | undefined = undefined;
    let prevMemberType: number | undefined = undefined;
    for (const member of interfaceDeclaration.members) {
      const memberKind = member.kind;
      let memberType = 0;
      // If it is a property declaration we need to check the type too
      if (member.kind === ts.SyntaxKind.PropertySignature) {
        const propertySignature = member as ts.PropertySignature;
        // Special care for function type
        if (
          propertySignature.type &&
          propertySignature.type.kind === ts.SyntaxKind.FunctionType
        ) {
          // We only set memberType for Functions
          memberType = propertySignature.type.kind;
        }
      }
      if (
        prevMemberKind !== undefined &&
        (prevMemberKind !== memberKind || prevMemberType !== memberType)
      ) {
        invalidNodes.push(createInvalidNode(member));
      }
      prevMemberKind = memberKind;
      prevMemberType = memberType;
    }
  }
  return { invalidNodes };
}
