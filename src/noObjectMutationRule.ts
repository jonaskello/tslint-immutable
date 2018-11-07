import * as ts from "typescript";
import * as Lint from "tslint";
import {
  createInvalidNode,
  CheckNodeResult,
  createCheckNodeRule,
  InvalidNode
} from "./shared/check-node";
import * as Ignore from "./shared/ignore";

type Options = Ignore.IgnorePrefixOption;

// tslint:disable-next-line:variable-name
export const Rule = createCheckNodeRule(
  checkNode,
  "Modifying properties of existing object not allowed."
);

const objPropAccessors: ReadonlyArray<ts.SyntaxKind> = [
  ts.SyntaxKind.ElementAccessExpression,
  ts.SyntaxKind.PropertyAccessExpression
];

const forbidObjPropOnLeftSideOf: ReadonlyArray<ts.SyntaxKind> = [
  ts.SyntaxKind.EqualsToken,
  ts.SyntaxKind.PlusEqualsToken,
  ts.SyntaxKind.MinusEqualsToken,
  ts.SyntaxKind.AsteriskEqualsToken,
  ts.SyntaxKind.AsteriskAsteriskEqualsToken,
  ts.SyntaxKind.SlashEqualsToken,
  ts.SyntaxKind.PercentEqualsToken,
  ts.SyntaxKind.LessThanLessThanEqualsToken,
  ts.SyntaxKind.GreaterThanGreaterThanEqualsToken,
  ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken,
  ts.SyntaxKind.AmpersandEqualsToken,
  ts.SyntaxKind.BarEqualsToken,
  ts.SyntaxKind.CaretEqualsToken
];

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
    objPropAccessors.some(k => k === node.left.kind) &&
    forbidObjPropOnLeftSideOf.some(k => k === node.operatorToken.kind) &&
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
    objPropAccessors.some(k => k === node.expression.kind) &&
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
    objPropAccessors.some(k => k === node.operand.kind) &&
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
    objPropAccessors.some(k => k === node.operand.kind) &&
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
