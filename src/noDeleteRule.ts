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
  "Unexpected delete, objects should be considered immutable."
);

function checkNode(
  node: ts.Node,
  _ctx: Lint.WalkContext<Options>
): CheckNodeResult {
  return node && node.kind === ts.SyntaxKind.DeleteExpression
    ? { invalidNodes: [createInvalidNode(node)] }
    : {
        invalidNodes: []
      };
}
