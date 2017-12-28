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
  "Method signature is mutable, use property signature with readonly modifier instead."
);

function checkNode(node: ts.Node, _ctx: Lint.WalkContext<{}>): CheckNodeResult {
  return node && node.kind === ts.SyntaxKind.MethodSignature
    ? { invalidNodes: [createInvalidNode(node)] }
    : {
        invalidNodes: []
      };
}
