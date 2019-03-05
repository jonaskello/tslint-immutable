import * as ts from "typescript";
import * as Lint from "tslint";
import * as utils from "tsutils/typeguard/2.8";
import * as Ignore from "./shared/ignore";
import {
  InvalidNode,
  createInvalidNode,
  CheckNodeResult,
  createCheckNodeRule
} from "./shared/check-node";
import {
  isFunctionLikeDeclaration,
  isVariableOrParameterOrPropertyDeclaration
} from "./shared/typeguard";

type Options = Ignore.IgnoreLocalOption &
  Ignore.IgnorePrefixOption &
  Ignore.IgnoreRestParametersOption &
  Ignore.IgnoreReturnType;

// tslint:disable-next-line:variable-name
export const Rule = createCheckNodeRule(
  Ignore.checkNodeWithIgnore(checkNode),
  "Only ReadonlyArray allowed."
);

function checkNode(
  node: ts.Node,
  ctx: Lint.WalkContext<Options>
): CheckNodeResult {
  return {
    invalidNodes: [
      ...checkArrayType(node, ctx),
      ...checkTypeReference(node, ctx),
      ...checkImplicitType(node, ctx)
    ]
  };
}

function checkArrayType(
  node: ts.Node,
  ctx: Lint.WalkContext<Options>
): ReadonlyArray<InvalidNode> {
  // We need to check both shorthand syntax "number[]"...
  if (utils.isArrayTypeNode(node)) {
    if (
      node.parent &&
      Ignore.shouldIgnorePrefix(node.parent, ctx.options, ctx.sourceFile)
    ) {
      return [];
    }

    if (
      ctx.options.ignoreRestParameters &&
      node.parent &&
      utils.isParameterDeclaration(node.parent) &&
      node.parent.dotDotDotToken
    ) {
      return [];
    }

    if (ctx.options.ignoreReturnType && checkIsReturnTypeOrNestedIn(node)) {
      return [];
    }

    return [
      createInvalidNode(node, [
        new Lint.Replacement(
          node.getStart(ctx.sourceFile),
          0,
          "ReadonlyArray<"
        ),
        new Lint.Replacement(node.end - 2, 2, ">")
      ])
    ];
  }
  return [];
}

function checkTypeReference(
  node: ts.Node,
  ctx: Lint.WalkContext<Options>
): ReadonlyArray<InvalidNode> {
  // ...and type reference "Array<number>"
  if (
    utils.isTypeReferenceNode(node) &&
    node.typeName.getText(ctx.sourceFile) === "Array"
  ) {
    if (
      node.parent &&
      Ignore.shouldIgnorePrefix(node.parent, ctx.options, ctx.sourceFile)
    ) {
      return [];
    }

    if (ctx.options.ignoreReturnType && checkIsReturnTypeOrNestedIn(node)) {
      return [];
    }

    return [
      createInvalidNode(node, [
        new Lint.Replacement(node.getStart(ctx.sourceFile), 0, "Readonly")
      ])
    ];
  }
  return [];
}

export function checkImplicitType(
  node: ts.Node,
  ctx: Lint.WalkContext<Options>
): ReadonlyArray<InvalidNode> {
  if (Ignore.shouldIgnorePrefix(node, ctx.options, ctx.sourceFile)) {
    return [];
  }
  // Check if the initializer is used to set an implicit array type
  if (
    isVariableOrParameterOrPropertyDeclaration(node) &&
    isUntypedAndHasArrayLiteralExpressionInitializer(node)
  ) {
    const length = node.name.getWidth(ctx.sourceFile);
    const nameText = node.name.getText(ctx.sourceFile);
    let typeArgument = "any";

    return [
      createInvalidNode(node.name, [
        new Lint.Replacement(
          node.name.end - length,
          length,
          `${nameText}: ReadonlyArray<${typeArgument}>`
        )
      ])
    ];
  }
  return [];
}

function checkIsReturnTypeOrNestedIn(
  node: ts.TypeReferenceNode | ts.ArrayTypeNode
): boolean {
  const getRootTypeReferenceNode = (
    typeNode: ts.TypeReferenceNode | ts.ArrayTypeNode
  ): ts.TypeReferenceNode | ts.ArrayTypeNode =>
    utils.isTypeReferenceNode(typeNode.parent)
      ? getRootTypeReferenceNode(typeNode.parent)
      : typeNode;

  const rootTypeReferenceNode = getRootTypeReferenceNode(node);

  return (
    rootTypeReferenceNode.parent &&
    isFunctionLikeDeclaration(rootTypeReferenceNode.parent) &&
    rootTypeReferenceNode === rootTypeReferenceNode.parent.type
  );
}

function isUntypedAndHasArrayLiteralExpressionInitializer(
  node:
    | ts.VariableDeclaration
    | ts.ParameterDeclaration
    | ts.PropertyDeclaration
): node is
  | ts.VariableDeclaration
  | ts.ParameterDeclaration & {
      initializer: ts.ArrayLiteralExpression;
    } {
  return Boolean(
    !node.type &&
      (node.initializer && utils.isArrayLiteralExpression(node.initializer))
  );
}
