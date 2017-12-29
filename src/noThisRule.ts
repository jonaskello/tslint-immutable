import * as ts from "typescript";
import * as Lint from "tslint";
import {
  createInvalidNode,
  CheckNodeResult,
  createCheckNodeRule
} from "./shared/check-node";

// tslint:disable-next-line:variable-name
export const Rule = createCheckNodeRule(
  checkNode,
  "Unexpected this, use functions not classes."
);

function checkNode(node: ts.Node, _ctx: Lint.WalkContext<{}>): CheckNodeResult {
  return node && node.kind === ts.SyntaxKind.ThisKeyword
    ? { invalidNodes: [createInvalidNode(node)] }
    : {
        invalidNodes: []
      };
}
