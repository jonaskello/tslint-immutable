import * as ts from "typescript";
import * as Lint from "tslint";
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
  if (node && node.kind === ts.SyntaxKind.ExpressionStatement) {
    const esNode = node as ts.ExpressionStatement;
    const children = esNode.getChildren();
    const isYield = children.every(
      (n: ts.Node) => n.kind === ts.SyntaxKind.YieldExpression
    );
    let text = esNode.getText(esNode.getSourceFile());
    if (esNode.expression.kind === ts.SyntaxKind.AwaitExpression) {
      const awaitNode = esNode.expression as ts.AwaitExpression;
      text = awaitNode.expression.getText(awaitNode.getSourceFile());
    }
    const isIgnored2 = Ignore.isIgnoredPrefix(text, ctx.options.ignorePrefix);
    if (!isYield && !isIgnored2) {
      return { invalidNodes: [createInvalidNode(esNode)] };
    }
  }
  return { invalidNodes: [] };
}
