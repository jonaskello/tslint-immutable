import * as ts from "typescript";
import * as Lint from "tslint";
import {
  createInvalidNode,
  CheckNodeResult,
  createCheckNodeRule
} from "./shared/check-node";

type Options = {};

// tslint:disable-next-line:variable-name
export const Rule = createCheckNodeRule(
  checkNode,
  "Unexpected loop, use map or reduce instead."
);

function checkNode(
  node: ts.Node,
  _ctx: Lint.WalkContext<Options>
): CheckNodeResult {
  return node &&
    (node.kind === ts.SyntaxKind.ForStatement ||
      node.kind === ts.SyntaxKind.ForInStatement ||
      node.kind === ts.SyntaxKind.ForOfStatement ||
      node.kind === ts.SyntaxKind.WhileStatement ||
      node.kind === ts.SyntaxKind.DoStatement)
    ? { invalidNodes: [createInvalidNode(node, [])] }
    : {
        invalidNodes: []
      };
}
