import * as ts from "typescript";
import * as Lint from "tslint";
import * as IgnoreOptions from "./shared/ignore";
import {
  createInvalidNode,
  CheckNodeResult,
  createCheckNodeRule
} from "./shared/check-node";

// tslint:disable-next-line:variable-name
export const Rule = createCheckNodeRule(
  IgnoreOptions.checkNodeWithIgnore(checkNode),
  "Only the same kind of members allowed in interfaces."
);

function checkNode(
  node: ts.Node,
  _ctx: Lint.WalkContext<IgnoreOptions.Options>
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
