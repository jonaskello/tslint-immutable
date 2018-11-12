import * as ts from "typescript";
import * as Lint from "tslint";
import * as utils from "tsutils";
import * as Ignore from "./shared/ignore";
import {
  InvalidNode,
  createInvalidNode,
  CheckNodeResult,
  createCheckNodeRule
} from "./shared/check-node";

type Options = Ignore.IgnoreLocalOption &
  Ignore.IgnorePrefixOption &
  Ignore.IgnoreClassOption &
  Ignore.IgnoreInterfaceOption;

/**
 * This rule checks that the readonly keyword is used in all PropertySignature and
 * IndexerSignature nodes (which are the only places that the readonly keyword can exist).
 */
// tslint:disable-next-line:variable-name
export const Rule = createCheckNodeRule(
  Ignore.checkNodeWithIgnore(checkNode),
  "A readonly modifier is required."
);

function checkNode(
  node: ts.Node,
  ctx: Lint.WalkContext<Options>
): CheckNodeResult {
  return { invalidNodes: checkPropertySignatureAndIndexSignature(node, ctx) };
}

function checkPropertySignatureAndIndexSignature(
  node: ts.Node,
  ctx: Lint.WalkContext<Options>
): ReadonlyArray<InvalidNode> {
  if (
    (utils.isPropertySignature(node) ||
      utils.isIndexSignatureDeclaration(node) ||
      utils.isPropertyDeclaration(node)) &&
    !(
      node.modifiers &&
      node.modifiers.filter(m => m.kind === ts.SyntaxKind.ReadonlyKeyword)
        .length > 0
    )
  ) {
    // Check if ignore-prefix applies
    if (Ignore.shouldIgnorePrefix(node, ctx.options, ctx.sourceFile)) {
      return [];
    }
    return [
      createInvalidNode(node, [
        new Lint.Replacement(node.getStart(ctx.sourceFile), 0, "readonly ")
      ])
    ];
  }
  return [];
}
