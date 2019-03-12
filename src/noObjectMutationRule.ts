import * as ts from "typescript";
import * as Lint from "tslint";
import * as utils from "tsutils/typeguard/2.8";
import { isAssignmentKind } from "tsutils/util";
import {
  createInvalidNode,
  CheckNodeResult,
  createCheckNodeTypedRule,
  InvalidNode
} from "./shared/check-node";
import * as Ignore from "./shared/ignore";
import { isAccessExpression } from "./shared/typeguard";

type Options = Ignore.IgnorePrefixOption;

// tslint:disable-next-line:variable-name
export const Rule = createCheckNodeTypedRule(
  checkNode,
  "Modifying properties of existing object not allowed."
);

type ObjectConstructorType = ts.Type & {
  symbol: {
    name: "ObjectConstructor";
  };
};

const forbidUnaryOps: ReadonlyArray<ts.SyntaxKind> = [
  ts.SyntaxKind.PlusPlusToken,
  ts.SyntaxKind.MinusMinusToken
];

function checkNode(
  node: ts.Node,
  ctx: Lint.WalkContext<Options>,
  checker: ts.TypeChecker
): CheckNodeResult {
  let invalidNodes: Array<InvalidNode> = [];

  // No assignment with object.property on the left
  if (
    utils.isBinaryExpression(node) &&
    isAccessExpression(node.left) &&
    utils.isBinaryExpression(node) &&
    isAssignmentKind(node.operatorToken.kind) &&
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
    utils.isDeleteExpression(node) &&
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
    utils.isPrefixUnaryExpression(node) &&
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
    utils.isPostfixUnaryExpression(node) &&
    isAccessExpression(node.operand) &&
    forbidUnaryOps.some(o => o === node.operator) &&
    !Ignore.isIgnoredPrefix(
      node.getText(node.getSourceFile()),
      ctx.options.ignorePrefix
    )
  ) {
    invalidNodes = [...invalidNodes, createInvalidNode(node, [])];
  }

  // No Object.assign on non-new.
  if (
    utils.isCallExpression(node) &&
    utils.isPropertyAccessExpression(node.expression) &&
    utils.isIdentifier(node.expression.name) &&
    node.expression.name.text === "assign" &&
    node.arguments.length >= 2 &&
    utils.isIdentifier(node.arguments[0]) &&
    !Ignore.isIgnoredPrefix(
      node.arguments[0].getText(node.arguments[0].getSourceFile()),
      ctx.options.ignorePrefix
    ) &&
    isObjectConstructorType(
      checker.getTypeAtLocation(node.expression.expression)
    )
  ) {
    invalidNodes = [...invalidNodes, createInvalidNode(node, [])];
  }

  return { invalidNodes };
}

function inConstructor(nodeIn: ts.Node): boolean {
  let node = nodeIn.parent;
  while (node) {
    if (utils.isConstructorDeclaration(node)) {
      return true;
    }
    node = node.parent;
  }
  return false;
}

export function isObjectConstructorType(
  type: ts.Type
): type is ObjectConstructorType {
  return Boolean(type.symbol && type.symbol.name === "ObjectConstructor");
}
