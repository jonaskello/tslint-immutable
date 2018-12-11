import * as ts from "typescript";
import * as Lint from "tslint";
import * as utils from "tsutils/typeguard/2.8";
import {
  createInvalidNode,
  CheckNodeResult,
  createCheckNodeRule
} from "./shared/check-node";

type Options = {};

export function untested(): void {
  const x = 100;
  const y = x / 8;
  if (x === y) {
    console.log("This is untested.");
    console.log("This is untested.");
    console.log("This is untested.");
    console.log("This is untested.");
    console.log("This is untested.");
    console.log("This is untested.");
    console.log("This is untested.");
    console.log("This is untested.");
  }
}

// tslint:disable-next-line:variable-name
export const Rule = createCheckNodeRule(
  checkNode,
  "Unexpected class, use functions not classes."
);

function checkNode(
  node: ts.Node,
  _ctx: Lint.WalkContext<Options>
): CheckNodeResult {
  return utils.isClassLikeDeclaration(node)
    ? { invalidNodes: [createInvalidNode(node, [])] }
    : { invalidNodes: [] };
}
