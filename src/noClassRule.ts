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
  "Unexpected class, use functions not classes."
);

function checkNode(
  node: ts.Node,
  _ctx: Lint.WalkContext<Options>
): CheckNodeResult {
  return ts.isClassLike(node)
    ? { invalidNodes: [createInvalidNode(node, [])] }
    : { invalidNodes: [] };
}
