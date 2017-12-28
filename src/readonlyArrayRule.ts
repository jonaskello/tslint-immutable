import * as ts from "typescript";
import * as Lint from "tslint";
import * as Shared from "./shared-readonly";
import { InvalidNode, createInvalidNode } from "./shared";

export class Rule extends Lint.Rules.AbstractRule {
  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithFunction(
      sourceFile,
      (ctx: Lint.WalkContext<Shared.Options>) =>
        Shared.walk(ctx, checkNode, "Only ReadonlyArray allowed."),
      Shared.parseOptions(this.ruleArguments)
    );
  }
}

function checkNode(
  node: ts.Node,
  ctx: Lint.WalkContext<Shared.Options>
): ReadonlyArray<InvalidNode> {
  const explicitTypeFailures = checkArrayTypeOrReference(node, ctx);
  const implicitTypeFailures = checkVariableOrParameterImplicitType(node, ctx);
  return explicitTypeFailures.concat(implicitTypeFailures);
}

function checkArrayTypeOrReference(
  node: ts.Node,
  ctx: Lint.WalkContext<Shared.Options>
): ReadonlyArray<InvalidNode> {
  // We need to check both shorthand syntax "number[]" and type reference "Array<number>"
  if (
    node.kind === ts.SyntaxKind.ArrayType ||
    (node.kind === ts.SyntaxKind.TypeReference &&
      (node as ts.TypeReferenceNode).typeName.getText(ctx.sourceFile) ===
        "Array")
  ) {
    if (
      node.parent &&
      Shared.shouldIgnorePrefix(node.parent, ctx.options, ctx.sourceFile)
    ) {
      return [];
    }
    let typeArgument: string = "T";
    if (node.kind === ts.SyntaxKind.ArrayType) {
      const typeNode = node as ts.ArrayTypeNode;
      typeArgument = typeNode.elementType.getFullText(ctx.sourceFile).trim();
    } else if (node.kind === ts.SyntaxKind.TypeReference) {
      const typeNode = node as ts.TypeReferenceNode;
      if (typeNode.typeArguments) {
        typeArgument = typeNode.typeArguments[0]
          .getFullText(ctx.sourceFile)
          .trim();
      }
    }
    const length = node.getWidth(ctx.sourceFile);
    return [
      createInvalidNode(
        node,
        new Lint.Replacement(
          node.end - length,
          length,
          `ReadonlyArray<${typeArgument}>`
        )
      )
    ];
  }
  return [];
}

function checkVariableOrParameterImplicitType(
  node: ts.Node,
  ctx: Lint.WalkContext<Shared.Options>
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
    if (Shared.shouldIgnorePrefix(node, ctx.options, ctx.sourceFile)) {
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
          createInvalidNode(
            varOrParamNode.name,
            new Lint.Replacement(
              varOrParamNode.name.end - length,
              length,
              `${nameText}: ReadonlyArray<${typeArgument}>`
            )
          )
        ];
      }
    }
  }
  return [];
}
