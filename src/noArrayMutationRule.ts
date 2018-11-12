import * as ts from "typescript";
import * as Lint from "tslint";
import * as utils from "tsutils";
import {
  createInvalidNode,
  CheckNodeResult,
  createCheckNodeTypedRule,
  InvalidNode
} from "./shared/check-node";
import * as Ignore from "./shared/ignore";
import { isAccessExpression } from "./shared/typeguard";

type Options = Ignore.IgnoreMutationFollowingAccessorOption &
  Ignore.IgnorePrefixOption;

type ArrayType = ts.Type & {
  symbol: {
    name: "Array";
  };
};

// tslint:disable-next-line:variable-name
export const Rule = createCheckNodeTypedRule(
  checkTypedNode,
  "Mutating an array is not allowed."
);

export function isArrayType(type: ts.Type): type is ArrayType {
  return Boolean(type.symbol && type.symbol.name === "Array");
}

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
  if (utils.isBinaryExpression(node)) {
    return checkBinaryExpression(node, ctx, checker);
  }

  if (utils.isDeleteExpression(node)) {
    return checkDeleteExpression(node, ctx, checker);
  }

  if (utils.isPrefixUnaryExpression(node)) {
    return checkPrefixUnaryExpression(node, ctx, checker);
  }

  if (utils.isPostfixUnaryExpression(node)) {
    return checkPostfixUnaryExpression(node, ctx, checker);
  }

  if (utils.isCallExpression(node)) {
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
    !Ignore.isIgnoredPrefix(
      node.getText(node.getSourceFile()),
      ctx.options.ignorePrefix
    ) &&
    utils.isBinaryExpression(node) &&
    utils.isAssignmentKind(node.operatorToken.kind) &&
    isAccessExpression(node.left)
  ) {
    const leftExpressionType = checker.getTypeAtLocation(node.left.expression);

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
    !Ignore.isIgnoredPrefix(
      node.expression.getText(node.getSourceFile()),
      ctx.options.ignorePrefix
    ) &&
    isAccessExpression(node.expression)
  ) {
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
 * No prefix inc/dec.
 */
function checkPrefixUnaryExpression(
  node: ts.PrefixUnaryExpression,
  ctx: Lint.WalkContext<Options>,
  checker: ts.TypeChecker
): ReadonlyArray<InvalidNode> {
  if (
    !Ignore.isIgnoredPrefix(
      node.operand.getText(node.getSourceFile()),
      ctx.options.ignorePrefix
    ) &&
    isAccessExpression(node.operand) &&
    forbidUnaryOps.some(o => o === node.operator)
  ) {
    const operandExpressionType = checker.getTypeAtLocation(
      node.operand.expression
    );

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
    !Ignore.isIgnoredPrefix(
      node.getText(node.getSourceFile()),
      ctx.options.ignorePrefix
    ) &&
    isAccessExpression(node.operand) &&
    forbidUnaryOps.some(o => o === node.operator)
  ) {
    const operandExpressionType = checker.getTypeAtLocation(
      node.operand.expression
    );

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
    !Ignore.isIgnoredPrefix(
      node.getText(node.getSourceFile()),
      ctx.options.ignorePrefix
    ) &&
    utils.isPropertyAccessExpression(node.expression) &&
    (!ctx.options.ignoreMutationFollowingAccessor ||
      !isInChainCallAndFollowsAccessor(node.expression)) &&
    mutatorMethods.some(
      m => m === (node.expression as ts.PropertyAccessExpression).name.text
    )
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
  return (
    utils.isCallExpression(node.expression) &&
    utils.isPropertyAccessExpression(node.expression.expression) &&
    accessorMethods.some(
      m =>
        m ===
        ((node.expression as ts.CallExpression)
          .expression as ts.PropertyAccessExpression).name.text
    )
  );
}
