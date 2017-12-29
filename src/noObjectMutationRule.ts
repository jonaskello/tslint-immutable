import * as ts from "typescript";
import * as Lint from "tslint";
import {
  createInvalidNode,
  CheckNodeResult,
  createCheckNodeRule,
  InvalidNode
} from "./shared/check-node";

export interface Options {
  readonly ignorePrefix?: string | string[];
}

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
  if (node && node.kind === ts.SyntaxKind.BinaryExpression) {
    const binExp = node as ts.BinaryExpression;
    if (
      objPropAccessors.some(k => k === binExp.left.kind) &&
      forbidObjPropOnLeftSideOf.some(k => k === binExp.operatorToken.kind) &&
      !isIgnored(binExp.getText(node.getSourceFile()), ctx.options.ignorePrefix)
    ) {
      invalidNodes = [...invalidNodes, createInvalidNode(node)];
    }
  }

  // No deleting object properties
  if (node && node.kind === ts.SyntaxKind.DeleteExpression) {
    const delExp = node as ts.DeleteExpression;
    if (
      objPropAccessors.some(k => k === delExp.expression.kind) &&
      !isIgnored(
        delExp.expression.getText(node.getSourceFile()),
        ctx.options.ignorePrefix
      )
    ) {
      invalidNodes = [...invalidNodes, createInvalidNode(node)];
    }
  }

  // No prefix inc/dec
  if (node && node.kind === ts.SyntaxKind.PrefixUnaryExpression) {
    const preExp = node as ts.PrefixUnaryExpression;
    if (
      objPropAccessors.some(k => k === preExp.operand.kind) &&
      forbidUnaryOps.some(o => o === preExp.operator) &&
      !isIgnored(
        preExp.operand.getText(node.getSourceFile()),
        ctx.options.ignorePrefix
      )
    ) {
      invalidNodes = [...invalidNodes, createInvalidNode(node)];
    }
  }

  // No postfix inc/dec
  if (node && node.kind === ts.SyntaxKind.PostfixUnaryExpression) {
    const postExp = node as ts.PostfixUnaryExpression;
    if (
      objPropAccessors.some(k => k === postExp.operand.kind) &&
      forbidUnaryOps.some(o => o === postExp.operator) &&
      !isIgnored(
        postExp.getText(node.getSourceFile()),
        ctx.options.ignorePrefix
      )
    ) {
      invalidNodes = [...invalidNodes, createInvalidNode(node)];
    }
  }

  return { invalidNodes };
}

function isIgnored(
  text: string,
  ignorePrefix: Array<string> | string | undefined
): boolean {
  if (!ignorePrefix) {
    return false;
  }
  if (Array.isArray(ignorePrefix)) {
    if (ignorePrefix.find(pfx => text.indexOf(pfx) === 0)) {
      return true;
    }
  } else {
    if (text.indexOf(ignorePrefix) === 0) {
      return true;
    }
  }
  return false;
}
