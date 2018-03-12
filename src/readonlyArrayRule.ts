import * as ts from "typescript";
import * as Lint from "tslint";
import * as Ignore from "./shared/ignore";
import {
  InvalidNode,
  createInvalidNode,
  CheckNodeResult,
  createCheckNodeRule
} from "./shared/check-node";

type Options = Ignore.IgnoreLocalOption & Ignore.IgnorePrefixOption;

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
  if (node.kind === ts.SyntaxKind.ArrayType) {
    if (
      node.parent &&
      Ignore.shouldIgnorePrefix(node.parent, ctx.options, ctx.sourceFile)
    ) {
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
    node.kind === ts.SyntaxKind.TypeReference &&
    (node as ts.TypeReferenceNode).typeName.getText(ctx.sourceFile) === "Array"
  ) {
    if (
      node.parent &&
      Ignore.shouldIgnorePrefix(node.parent, ctx.options, ctx.sourceFile)
    ) {
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
    node.kind === ts.SyntaxKind.VariableDeclaration ||
    node.kind === ts.SyntaxKind.Parameter ||
    node.kind === ts.SyntaxKind.PropertyDeclaration
  ) {
    // The initializer is used to set and implicit type
    const varOrParamNode = node as
      | ts.VariableDeclaration
      | ts.ParameterDeclaration;
    if (Ignore.shouldIgnorePrefix(node, ctx.options, ctx.sourceFile)) {
      return [];
    }
    if (!varOrParamNode.type) {
      if (
        varOrParamNode.initializer &&
        varOrParamNode.initializer.kind === ts.SyntaxKind.ArrayLiteralExpression
      ) {
        const length = varOrParamNode.name.getWidth(ctx.sourceFile);
        const nameText = varOrParamNode.name.getText(ctx.sourceFile);
        let typeArgument = "any";
        // Not sure it is a good idea to guess what the element types are...
        // const arrayLiteralNode = varOrParamNode.initializer as ts.ArrayLiteralExpression;
        // if (arrayLiteralNode.elements.length > 0) {
        //   const element = arrayLiteralNode.elements[0];
        //   if (element.kind === ts.SyntaxKind.NumericLiteral) {
        //     typeArgument = "number";
        //   } else if (element.kind === ts.SyntaxKind.StringLiteral) {
        //     typeArgument = "string";
        //   } else if (element.kind === ts.SyntaxKind.TrueKeyword || element.kind === ts.SyntaxKind.FalseKeyword) {
        //     typeArgument = "boolean";
        //   }
        // }
        return [
          createInvalidNode(varOrParamNode.name, [
            new Lint.Replacement(
              varOrParamNode.name.end - length,
              length,
              `${nameText}: ReadonlyArray<${typeArgument}>`
            )
          ])
        ];
      }
    }
  }
  return [];
}
