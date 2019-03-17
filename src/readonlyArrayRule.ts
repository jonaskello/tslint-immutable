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
    // Ignore arrays decleared with readonly keyword.
    if (
      node.parent &&
      utils.isTypeOperatorNode(node.parent) &&
      node.parent.operator === ts.SyntaxKind.ReadonlyKeyword
    ) {
      return [];
    }

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

    if (ctx.options.ignoreReturnType && checkIsReturnTypeOrNestedWithIn(node)) {
      return [];
    }

    const [major, minor] = ts.version
      .split(".")
      .map(n => Number.parseInt(n, 10));

    return [
      createInvalidNode(
        node,
        major > 3 || (major === 3 && minor >= 4)
          ? getReadonlyKeywordFix(node, ctx)
          : getReadonlyArrayFix(node, ctx)
      )
    ];
  }
  return [];
}

function getReadonlyKeywordFix(
  node: ts.ArrayTypeNode,
  ctx: Lint.WalkContext<Options>
): Lint.Replacement[] {
  // Nested shorthand syntax array?
  if (utils.isArrayTypeNode(node.parent)) {
    return [
      new Lint.Replacement(node.getStart(ctx.sourceFile), 0, "(readonly "),
      new Lint.Replacement(node.end, 0, ")")
    ];
  }
  return [new Lint.Replacement(node.getStart(ctx.sourceFile), 0, "readonly ")];
}

function getReadonlyArrayFix(
  node: ts.ArrayTypeNode,
  ctx: Lint.WalkContext<Options>
): Lint.Replacement[] {
  return [
    new Lint.Replacement(node.getStart(ctx.sourceFile), 0, "ReadonlyArray<"),
    new Lint.Replacement(node.end - 2, 2, ">")
  ];
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

    if (ctx.options.ignoreReturnType && checkIsReturnTypeOrNestedWithIn(node)) {
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

function checkIsReturnTypeOrNestedWithIn(node: ts.Node): boolean {
  return node.parent
    ? isFunctionLikeDeclaration(node.parent) && node === node.parent.type
      ? true
      : checkIsReturnTypeOrNestedWithIn(node.parent)
    : false;
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
