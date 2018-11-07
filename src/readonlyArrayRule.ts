import * as ts from "typescript";
import * as Lint from "tslint";
import * as Ignore from "./shared/ignore";
import {
  InvalidNode,
  createInvalidNode,
  CheckNodeResult,
  createCheckNodeRule
} from "./shared/check-node";

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
      ...checkVariableOrParameterImplicitType(node, ctx)
    ]
  };
}

function checkArrayType(
  node: ts.Node,
  ctx: Lint.WalkContext<Options>
): ReadonlyArray<InvalidNode> {
  // We need to check both shorthand syntax "number[]"...
  if (ts.isArrayTypeNode(node)) {
    if (
      node.parent &&
      Ignore.shouldIgnorePrefix(node.parent, ctx.options, ctx.sourceFile)
    ) {
      return [];
    }

    if (
      ctx.options.ignoreRestParameters &&
      ts.isParameter(node.parent) &&
      node.parent.dotDotDotToken
    ) {
      return [];
    }

    if (ctx.options.ignoreReturnType && checkIsReturnType(node)) {
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
    ts.isTypeReferenceNode(node) &&
    node.typeName.getText(ctx.sourceFile) === "Array"
  ) {
    if (
      node.parent &&
      Ignore.shouldIgnorePrefix(node.parent, ctx.options, ctx.sourceFile)
    ) {
      return [];
    }

    if (ctx.options.ignoreReturnType && checkIsReturnType(node)) {
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

function checkVariableOrParameterImplicitType(
  node: ts.Node,
  ctx: Lint.WalkContext<Options>
): ReadonlyArray<InvalidNode> {
  if (
    ts.isVariableDeclaration(node) ||
    ts.isParameter(node) ||
    ts.isPropertyDeclaration(node)
  ) {
    // The initializer is used to set and implicit type
    if (Ignore.shouldIgnorePrefix(node, ctx.options, ctx.sourceFile)) {
      return [];
    }
    if (
      !node.type &&
      node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      const length = node.name.getWidth(ctx.sourceFile);
      const nameText = node.name.getText(ctx.sourceFile);
      let typeArgument = "any";
      // Not sure it is a good idea to guess what the element types are...
      // if (node.initializer.elements.length > 0) {
      //   const element = node.initializer.elements[0];
      //   if (ts.isNumericLiteral(element)) {
      //     typeArgument = "number";
      //   } else if (ts.isStringLiteral(element)) {
      //     typeArgument = "string";
      //   } else if (
      //     element.kind === ts.SyntaxKind.TrueKeyword ||
      //     element.kind === ts.SyntaxKind.FalseKeyword
      //   ) {
      //     typeArgument = "boolean";
      //   }
      // }
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
  }
  return [];
}

function checkIsReturnType(node: ts.Node): boolean {
  return Boolean(ts.isFunctionLike(node.parent) && node === node.parent.type);
}
