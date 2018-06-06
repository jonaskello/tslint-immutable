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
  "Mutilating an array is not allowed."
);

const arrPropAccessors: ReadonlyArray<ts.SyntaxKind> = [
  ts.SyntaxKind.ElementAccessExpression,
  ts.SyntaxKind.PropertyAccessExpression
];

const forbidArrPropOnLeftSideOf: ReadonlyArray<ts.SyntaxKind> = [
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

const forbiddenMethods: ReadonlyArray<string> = [
  "copyWithin",
  "fill",
  "pop",
  "push",
  "reverse",
  "shift",
  "sort",
  "splice",
  "unshift"
];

function checkNode(
  node: ts.Node,
  ctx: Lint.WalkContext<Options>
): CheckNodeResult {
  let invalidNodes: Array<InvalidNode> = [];

  // No assignment with array[index] on the left
  // No assignment with array.property on the left
  if (node && node.kind === ts.SyntaxKind.BinaryExpression) {
    const binExp = node as ts.BinaryExpression;
    if (
      arrPropAccessors.some(k => k === binExp.left.kind) &&
      forbidArrPropOnLeftSideOf.some(k => k === binExp.operatorToken.kind) &&
      !Ignore.isIgnoredPrefix(
        binExp.getText(node.getSourceFile()),
        ctx.options.ignorePrefix
      )
    ) {
      invalidNodes = [...invalidNodes, createInvalidNode(node, [])];
    }
  }

  // No deleting array properties/values
  if (node && node.kind === ts.SyntaxKind.DeleteExpression) {
    const delExp = node as ts.DeleteExpression;
    if (
      arrPropAccessors.some(k => k === delExp.expression.kind) &&
      !Ignore.isIgnoredPrefix(
        delExp.expression.getText(node.getSourceFile()),
        ctx.options.ignorePrefix
      )
    ) {
      invalidNodes = [...invalidNodes, createInvalidNode(node, [])];
    }
  }

  // No prefix inc/dec
  if (node && node.kind === ts.SyntaxKind.PrefixUnaryExpression) {
    const preExp = node as ts.PrefixUnaryExpression;
    if (
      arrPropAccessors.some(k => k === preExp.operand.kind) &&
      forbidUnaryOps.some(o => o === preExp.operator) &&
      !Ignore.isIgnoredPrefix(
        preExp.operand.getText(node.getSourceFile()),
        ctx.options.ignorePrefix
      )
    ) {
      invalidNodes = [...invalidNodes, createInvalidNode(node, [])];
    }
  }

  // No postfix inc/dec
  if (node && node.kind === ts.SyntaxKind.PostfixUnaryExpression) {
    const postExp = node as ts.PostfixUnaryExpression;
    if (
      arrPropAccessors.some(k => k === postExp.operand.kind) &&
      forbidUnaryOps.some(o => o === postExp.operator) &&
      !Ignore.isIgnoredPrefix(
        postExp.getText(node.getSourceFile()),
        ctx.options.ignorePrefix
      )
    ) {
      invalidNodes = [...invalidNodes, createInvalidNode(node, [])];
    }
  }

  // No calls to array mutilating methods
  if (node && node.kind === ts.SyntaxKind.CallExpression) {
    const callExp = node as ts.CallExpression;
    if (ts.SyntaxKind.PropertyAccessExpression === callExp.expression.kind) {
      const propAccExp = callExp.expression as ts.PropertyAccessExpression;
      if (
        forbiddenMethods.some(m => m === propAccExp.name.text) &&
        !Ignore.isIgnoredPrefix(
          callExp.getText(node.getSourceFile()),
          ctx.options.ignorePrefix
        )
      ) {
        invalidNodes = [...invalidNodes, createInvalidNode(node, [])];
      }
    }
  }

  return { invalidNodes };
}
