/**
 * This file has functions that typeguard the given node/type.
 */

import * as ts from "typescript";
import * as utils from "tsutils";

export function isAccessExpression(
  node: ts.Node
): node is ts.ElementAccessExpression | ts.PropertyAccessExpression {
  return (
    utils.isElementAccessExpression(node) ||
    utils.isPropertyAccessExpression(node)
  );
}

export function isFunctionLikeDeclaration(
  node: ts.Node
): node is ts.FunctionLikeDeclaration {
  return (
    utils.isArrowFunction(node) ||
    utils.isConstructorDeclaration(node) ||
    utils.isFunctionDeclaration(node) ||
    utils.isFunctionExpression(node) ||
    utils.isGetAccessorDeclaration(node) ||
    utils.isMethodDeclaration(node) ||
    utils.isSetAccessorDeclaration(node)
  );
}

export function isVariableLike(
  node: ts.Node
): node is ts.VariableLikeDeclaration {
  return (
    utils.isBindingElement(node) ||
    utils.isEnumMember(node) ||
    utils.isParameterDeclaration(node) ||
    utils.isPropertyAssignment(node) ||
    utils.isPropertyDeclaration(node) ||
    utils.isPropertySignature(node) ||
    utils.isShorthandPropertyAssignment(node) ||
    utils.isVariableDeclaration(node)
  );
}
