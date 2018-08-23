import * as ts from "typescript";
import * as Lint from "tslint";
import {
  createInvalidNode,
  CheckNodeResult,
  createCheckNodeTypedRule,
  InvalidNode
} from "./shared/check-node";
import * as Ignore from "./shared/ignore";

type Options = Ignore.IgnorePrefixOption;

type EntryAccessor = ts.ElementAccessExpression | ts.PropertyAccessExpression;

// tslint:disable-next-line:variable-name
export const Rule = createCheckNodeTypedRule(
  checkTypedNode,
  "Mutating an array is not allowed."
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

/**
 * Methods that mutate an array.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/prototype#Methods#Mutator_methods
 */
const mutatorMethods: ReadonlyArray<string> = [
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

/**
 * Methods that return a new array without mutating the original.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/prototype#Methods#Accessor_methods
 */
const accessorMethods: ReadonlyArray<string> = [
  "concat",
  "slice",
  "toSource" // TODO: This is a non standardized method, should it me including?
];

function isArrayType(type: ts.Type): boolean {
  return type.symbol !== undefined && type.symbol.name === "Array";
}

function checkTypedNode(
  node: ts.BinaryExpression,
  ctx: Lint.WalkContext<Options>,
  checker: ts.TypeChecker
): CheckNodeResult {
  return { invalidNodes: getInvalidNodes(node, ctx, checker) };
}

function getInvalidNodes(
  node: ts.Node,
  ctx: Lint.WalkContext<Options>,
  checker: ts.TypeChecker
): ReadonlyArray<InvalidNode> {
  switch (node.kind) {
    case ts.SyntaxKind.BinaryExpression:
      return checkBinaryExpression(node as ts.BinaryExpression, ctx, checker);

    case ts.SyntaxKind.DeleteExpression:
      return checkDeleteExpression(node as ts.DeleteExpression, ctx, checker);

    case ts.SyntaxKind.PrefixUnaryExpression:
      return checkPrefixUnaryExpression(
        node as ts.PrefixUnaryExpression,
        ctx,
        checker
      );

    case ts.SyntaxKind.PostfixUnaryExpression:
      return checkPostfixUnaryExpression(
        node as ts.PostfixUnaryExpression,
        ctx,
        checker
      );

    case ts.SyntaxKind.CallExpression:
      return checkCallExpression(node as ts.CallExpression, ctx, checker);

    default:
      return [];
  }
}

/**
 * No assignment with array[index] on the left.
 * No assignment with array.property on the left (e.g. array.length).
 */
function checkBinaryExpression(
  node: ts.BinaryExpression,
  ctx: Lint.WalkContext<Options>,
  checker: ts.TypeChecker
): ReadonlyArray<InvalidNode> {
  if (
    arrPropAccessors.some(k => k === node.left.kind) &&
    forbidArrPropOnLeftSideOf.some(k => k === node.operatorToken.kind) &&
    !Ignore.isIgnoredPrefix(
      node.getText(node.getSourceFile()),
      ctx.options.ignorePrefix
    )
  ) {
    const left = node.left as EntryAccessor;
    const leftExpressionType = checker.getTypeAtLocation(left.expression);

    if (isArrayType(leftExpressionType)) {
      return [createInvalidNode(node, [])];
    }
  }
  return [];
}

/**
 * No deleting array properties/values.
 */
function checkDeleteExpression(
  node: ts.DeleteExpression,
  ctx: Lint.WalkContext<Options>,
  checker: ts.TypeChecker
): ReadonlyArray<InvalidNode> {
  const delExp = node as ts.DeleteExpression;
  if (
    arrPropAccessors.some(k => k === delExp.expression.kind) &&
    !Ignore.isIgnoredPrefix(
      delExp.expression.getText(node.getSourceFile()),
      ctx.options.ignorePrefix
    )
  ) {
    const delExpExp = delExp.expression as EntryAccessor;
    const expressionType = checker.getTypeAtLocation(delExpExp.expression);

    if (isArrayType(expressionType)) {
      return [createInvalidNode(node, [])];
    }
  }
  return [];
}

/**
 * No prefix inc/dec.
 */
function checkPrefixUnaryExpression(
  node: ts.PrefixUnaryExpression,
  ctx: Lint.WalkContext<Options>,
  checker: ts.TypeChecker
): ReadonlyArray<InvalidNode> {
  const preExp = node as ts.PrefixUnaryExpression;
  if (
    arrPropAccessors.some(k => k === preExp.operand.kind) &&
    forbidUnaryOps.some(o => o === preExp.operator) &&
    !Ignore.isIgnoredPrefix(
      preExp.operand.getText(node.getSourceFile()),
      ctx.options.ignorePrefix
    )
  ) {
    const operand = preExp.operand as EntryAccessor;
    const operandExpressionType = checker.getTypeAtLocation(operand.expression);

    if (isArrayType(operandExpressionType)) {
      return [createInvalidNode(node, [])];
    }
  }
  return [];
}

/**
 * No postfix inc/dec.
 */
function checkPostfixUnaryExpression(
  node: ts.PostfixUnaryExpression,
  ctx: Lint.WalkContext<Options>,
  checker: ts.TypeChecker
): ReadonlyArray<InvalidNode> {
  const postExp = node as ts.PostfixUnaryExpression;
  if (
    arrPropAccessors.some(k => k === postExp.operand.kind) &&
    forbidUnaryOps.some(o => o === postExp.operator) &&
    !Ignore.isIgnoredPrefix(
      postExp.getText(node.getSourceFile()),
      ctx.options.ignorePrefix
    )
  ) {
    const operand = postExp.operand as EntryAccessor;
    const operandExpressionType = checker.getTypeAtLocation(operand.expression);

    if (isArrayType(operandExpressionType)) {
      return [createInvalidNode(node, [])];
    }
  }
  return [];
}

/**
 * No calls to array mutating methods.
 */
function checkCallExpression(
  node: ts.CallExpression,
  ctx: Lint.WalkContext<Options>,
  checker: ts.TypeChecker
): ReadonlyArray<InvalidNode> {
  const callExp = node as ts.CallExpression;
  if (ts.SyntaxKind.PropertyAccessExpression === callExp.expression.kind) {
    const propAccExp = callExp.expression as ts.PropertyAccessExpression;
    if (
      mutatorMethods.some(m => m === propAccExp.name.text) &&
      !Ignore.isIgnoredPrefix(
        callExp.getText(node.getSourceFile()),
        ctx.options.ignorePrefix
      )
    ) {
      const expressionType = checker.getTypeAtLocation(propAccExp.expression);

      if (isArrayType(expressionType)) {
        return [createInvalidNode(node, [])];
      }
    }
  }
  return [];
}
