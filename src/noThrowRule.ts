import * as ts from "typescript";
import * as Lint from "tslint";
import * as utils from "tsutils/typeguard/2.8";
import {
  createInvalidNode,
  CheckNodeResult,
  createCheckNodeRule
} from "./shared/check-node";

type Options = {};

// tslint:disable-next-line:variable-name
export const Rule = createCheckNodeRule(
  checkNode,
  "Unexpected throw, throwing exceptions is not functional."
);

function checkNode(
  node: ts.Node,
  _ctx: Lint.WalkContext<Options>
): CheckNodeResult {
  if (utils.isThrowStatement(node)) {
    return { invalidNodes: [createInvalidNode(node, [])] };
  }
  if (
    ts.isPropertyAccessExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === "Promise" &&
    node.name.text === "reject"
  ) {
    return { invalidNodes: [createInvalidNode(node, [])] };
  }
  return { invalidNodes: [] };
}
