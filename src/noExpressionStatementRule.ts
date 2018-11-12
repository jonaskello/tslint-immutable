import * as ts from "typescript";
import * as Lint from "tslint";
import * as utils from "tsutils";
import {
  createInvalidNode,
  CheckNodeResult,
  createCheckNodeRule
} from "./shared/check-node";
import * as Ignore from "./shared/ignore";

type Options = Ignore.IgnorePrefixOption;

// tslint:disable-next-line:variable-name
export const Rule = createCheckNodeRule(
  checkNode,
  "Using expressions to cause side-effects not allowed."
);

function checkNode(
  node: ts.Node,
  ctx: Lint.WalkContext<Options>
): CheckNodeResult {
  if (utils.isExpressionStatement(node)) {
    const children = node.getChildren();
    const isYield = children.every((n: ts.Node) => ts.isYieldExpression(n));
    let text = node.getText(node.getSourceFile());
    if (utils.isAwaitExpression(node.expression)) {
      text = node.expression.expression.getText(
        node.expression.getSourceFile()
      );
    }
    const isIgnored2 = Ignore.isIgnoredPrefix(text, ctx.options.ignorePrefix);
    if (!isYield && !isIgnored2) {
      return { invalidNodes: [createInvalidNode(node, [])] };
    }
  }
  return { invalidNodes: [] };
}
