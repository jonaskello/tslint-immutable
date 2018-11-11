/**
 * This file has functions that test the type of the given value.
 */

import * as ts from "typescript";

export function isAccessExpression(
  node: ts.Node
): node is ts.ElementAccessExpression | ts.PropertyAccessExpression {
  return (
    ts.isElementAccessExpression(node) || ts.isPropertyAccessExpression(node)
  );
}

export function isArrayType(type: ts.Type): boolean {
  return type.symbol.name === "Array";
}
