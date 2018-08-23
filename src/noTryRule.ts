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
  "Unexpected try, the try-catch[-finally] and try-finally patterns are not functional."
);

function checkNode(
  node: ts.Node,
  _ctx: Lint.WalkContext<Options>
): CheckNodeResult {
  return node && node.kind === ts.SyntaxKind.TryStatement
    ? { invalidNodes: [createInvalidNode(node, [])] }
    : {
        invalidNodes: []
      };
}
