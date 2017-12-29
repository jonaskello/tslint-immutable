import * as ts from "typescript";
import * as Lint from "tslint";
import {
  createInvalidNode,
  CheckNodeResult,
  createCheckNodeRule
} from "./shared/check-node";
import * as Ignore from "./shared/ignore";

export interface Options {
  readonly ignorePrefix?: string | Array<string>;
}

// tslint:disable-next-line:variable-name
export const Rule = createCheckNodeRule(
  checkNode,
  "Using expressions to cause side-effects not allowed."
);

function checkNode(
  node: ts.Node,
  ctx: Lint.WalkContext<Options>
): CheckNodeResult {
  if (node && node.kind === ts.SyntaxKind.ExpressionStatement) {
    const children = node.getChildren();
    const text = node.getText(node.getSourceFile());
    const isYield = children.every(
      (n: ts.Node) => n.kind === ts.SyntaxKind.YieldExpression
    );
    const isIgnored2 = Ignore.isIgnoredPrefix(text, ctx.options.ignorePrefix);
    if (!isYield && !isIgnored2) {
      return { invalidNodes: [createInvalidNode(node)] };
    }
  }
  return { invalidNodes: [] };
}
