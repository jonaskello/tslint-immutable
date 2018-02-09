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
  "Unexpected if, use a conditional expression (ternary operator) instead."
);

function checkNode(
  node: ts.Node,
  _ctx: Lint.WalkContext<Options>
): CheckNodeResult {
  return node && node.kind === ts.SyntaxKind.IfStatement
    ? { invalidNodes: [createInvalidNode(node)] }
    : {
        invalidNodes: []
      };
}
