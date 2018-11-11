import * as ts from "typescript";
import * as Lint from "tslint";
import {
  createInvalidNode,
  CheckNodeResult,
  createCheckNodeRule,
  InvalidNode
} from "./shared/check-node";
import * as Ignore from "./shared/ignore";
import { isAccessExpression } from "./shared/check-type";

type Options = Ignore.IgnorePrefixOption;

// tslint:disable-next-line:variable-name
export const Rule = createCheckNodeRule(
  checkNode,
  "Modifying properties of existing object not allowed."
);

const forbidUnaryOps: ReadonlyArray<ts.SyntaxKind> = [
  ts.SyntaxKind.PlusPlusToken,
  ts.SyntaxKind.MinusMinusToken
];

function checkNode(
  node: ts.Node,
  ctx: Lint.WalkContext<Options>
): CheckNodeResult {
  let invalidNodes: Array<InvalidNode> = [];

  // No assignment with object.property on the left
  if (
    ts.isBinaryExpression(node) &&
    isAccessExpression(node.left) &&
    ts.isAssignmentExpression(node, false) &&
    !Ignore.isIgnoredPrefix(
      node.getText(node.getSourceFile()),
      ctx.options.ignorePrefix
    ) &&
    !inConstructor(node)
  ) {
    invalidNodes = [...invalidNodes, createInvalidNode(node, [])];
  }

  // No deleting object properties
  if (
    ts.isDeleteExpression(node) &&
    isAccessExpression(node.expression) &&
    !Ignore.isIgnoredPrefix(
      node.expression.getText(node.getSourceFile()),
      ctx.options.ignorePrefix
    )
  ) {
    invalidNodes = [...invalidNodes, createInvalidNode(node, [])];
  }

  // No prefix inc/dec
  if (
    ts.isPrefixUnaryExpression(node) &&
    isAccessExpression(node.operand) &&
    forbidUnaryOps.some(o => o === node.operator) &&
    !Ignore.isIgnoredPrefix(
      node.operand.getText(node.getSourceFile()),
      ctx.options.ignorePrefix
    )
  ) {
    invalidNodes = [...invalidNodes, createInvalidNode(node, [])];
  }

  // No postfix inc/dec
  if (
    ts.isPostfixUnaryExpression(node) &&
    isAccessExpression(node.operand) &&
    forbidUnaryOps.some(o => o === node.operator) &&
    !Ignore.isIgnoredPrefix(
      node.getText(node.getSourceFile()),
      ctx.options.ignorePrefix
    )
  ) {
    invalidNodes = [...invalidNodes, createInvalidNode(node, [])];
  }

  return { invalidNodes };
}

function inConstructor(nodeIn: ts.Node): boolean {
  let node = nodeIn.parent;
  while (node) {
    if (ts.isConstructorDeclaration(node)) {
      return true;
    }
    node = node.parent;
  }
  return false;
}
