import * as ts from "typescript";
import * as Lint from "tslint";
import {
  createInvalidNode,
  CheckNodeResult,
  createCheckNodeTypedRule,
  InvalidNode
} from "./shared/check-node";
import * as Ignore from "./shared/ignore";

type Options = Ignore.IgnoreMutationFollowingAccessorOption &
  Ignore.IgnorePrefixOption;

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
const accessorMethods: ReadonlyArray<string> = ["concat", "slice"];

function isArrayType(type: ts.Type): boolean {
  return type.symbol.name === "Array";
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
  if (ts.isBinaryExpression(node)) {
    return checkBinaryExpression(node, ctx, checker);
  }

  if (ts.isDeleteExpression(node)) {
    return checkDeleteExpression(node, ctx, checker);
  }

  if (ts.isPrefixUnaryExpression(node)) {
    return checkPrefixUnaryExpression(node, ctx, checker);
  }

  if (ts.isPostfixUnaryExpression(node)) {
    return checkPostfixUnaryExpression(node, ctx, checker);
  }

  if (ts.isCallExpression(node)) {
    return checkCallExpression(node, ctx, checker);
  }
  return [];
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
  if (
    arrPropAccessors.some(k => k === node.expression.kind) &&
    !Ignore.isIgnoredPrefix(
      node.expression.getText(node.getSourceFile()),
      ctx.options.ignorePrefix
    )
  ) {
    const delExpExp = node.expression as EntryAccessor;
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
  if (
    arrPropAccessors.some(k => k === node.operand.kind) &&
    forbidUnaryOps.some(o => o === node.operator) &&
    !Ignore.isIgnoredPrefix(
      node.operand.getText(node.getSourceFile()),
      ctx.options.ignorePrefix
    )
  ) {
    const operand = node.operand as EntryAccessor;
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
  if (
    arrPropAccessors.some(k => k === node.operand.kind) &&
    forbidUnaryOps.some(o => o === node.operator) &&
    !Ignore.isIgnoredPrefix(
      node.getText(node.getSourceFile()),
      ctx.options.ignorePrefix
    )
  ) {
    const operand = node.operand as EntryAccessor;
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
  if (
    ts.isPropertyAccessExpression(node.expression) &&
    mutatorMethods.some(
      m => m === (node.expression as ts.PropertyAccessExpression).name.text
    ) &&
    !Ignore.isIgnoredPrefix(
      node.getText(node.getSourceFile()),
      ctx.options.ignorePrefix
    ) &&
    (!ctx.options.ignoreMutationFollowingAccessor ||
      !isInChainCallAndFollowsAccessor(node.expression))
  ) {
    // Do the type checking as late as possible (as it is expensive).
    const expressionType = checker.getTypeAtLocation(
      node.expression.expression
    );

    if (isArrayType(expressionType)) {
      return [createInvalidNode(node, [])];
    }
  }
  return [];
}

/**
 * Check if the given the given PropertyAccessExpression is part of a chain and
 * immediately follows an accessor method call.
 *
 * If this is the case, then the given PropertyAccessExpression is allowed to be a mutator method call.
 */
function isInChainCallAndFollowsAccessor(
  node: ts.PropertyAccessExpression
): boolean {
  if (
    ts.isCallExpression(node.expression) &&
    ts.isPropertyAccessExpression(node.expression.expression) &&
    accessorMethods.some(
      m =>
        m ===
        ((node.expression as ts.CallExpression)
          .expression as ts.PropertyAccessExpression).name.text
    )
  ) {
    return true;
  }

  return false;
}
