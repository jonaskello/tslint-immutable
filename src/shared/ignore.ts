/**
 * This file has code that is shared for all the ignore options.
 */

import * as ts from "typescript";
import * as Lint from "tslint";
import * as utils from "tsutils/typeguard/2.8";
import * as CheckNode from "./check-node";
import {
  isFunctionLikeDeclaration,
  isVariableLikeDeclaration
} from "./typeguard";

export type Options = IgnoreLocalOption &
  IgnoreOption &
  IgnoreRestParametersOption &
  IgnoreClassOption &
  IgnoreInterfaceOption &
  IgnoreMutationFollowingAccessorOption;

export interface IgnoreLocalOption {
  readonly ignoreLocal?: boolean;
}

export interface IgnoreOption {
  readonly ignorePrefix?: string | Array<string> | undefined;
  readonly ignore?: string | Array<string> | undefined;
  readonly ignoreSuffix?: string | Array<string> | undefined;
}

export interface IgnoreRestParametersOption {
  readonly ignoreRestParameters?: boolean;
}

export interface IgnoreReturnType {
  readonly ignoreReturnType?: boolean;
}

export interface IgnoreClassOption {
  readonly ignoreClass?: boolean;
}

export interface IgnoreInterfaceOption {
  readonly ignoreInterface?: boolean;
}

export interface IgnoreNewArrayOption {
  readonly ignoreNewArray?: boolean;
}

/**
 * @deprecated Use `IgnoreNewArrayOption` instead.
 */
export interface IgnoreMutationFollowingAccessorOption {
  readonly ignoreMutationFollowingAccessor?: boolean;
}

export function checkNodeWithIgnore(
  checkNode: CheckNode.CheckNodeFunction<Options>
): CheckNode.CheckNodeFunction<Options> {
  return (node: ts.Node, ctx: Lint.WalkContext<Options>) => {
    // Skip checking in functions if ignore-local is set
    if (ctx.options.ignoreLocal && isFunctionLikeDeclaration(node)) {
      // We still need to check the parameters and return type
      const invalidNodes = checkIgnoreLocalFunctionNode(node, ctx, checkNode);
      // Now skip this whole branch
      return { invalidNodes, skipChildren: true };
    }

    // Skip checking in classes/interfaces if ignore-class/ignore-interface is set
    if (
      (ctx.options.ignoreClass && utils.isPropertyDeclaration(node)) ||
      (ctx.options.ignoreInterface && utils.isPropertySignature(node))
    ) {
      // Now skip this whole branch
      return { invalidNodes: [], skipChildren: true };
    }

    // Forward to check node
    return checkNode(node, ctx);
  };
}

function checkIgnoreLocalFunctionNode(
  functionNode: ts.FunctionLikeDeclaration,
  ctx: Lint.WalkContext<{}>,
  checkNode: CheckNode.CheckNodeFunction<{}>
): ReadonlyArray<CheckNode.InvalidNode> {
  let myInvalidNodes: Array<CheckNode.InvalidNode> = [];

  const cb = (node: ts.Node): void => {
    // Check the node
    const { invalidNodes, skipChildren } = checkNode(node, ctx);
    if (invalidNodes) {
      myInvalidNodes = myInvalidNodes.concat(...invalidNodes);
    }
    if (skipChildren) {
      return;
    }
    // Use return because performance hints docs say it optimizes the function using tail-call recursion
    return ts.forEachChild(node, cb);
  };

  // Check either the parameter's explicit type if it has one, or itself for implicit type
  for (const n of functionNode.parameters.map(p => (p.type ? p.type : p))) {
    // Check the parameter node itself
    const { invalidNodes: invalidCheckNodes } = checkNode(n, ctx);
    if (invalidCheckNodes) {
      myInvalidNodes = myInvalidNodes.concat(...invalidCheckNodes);
    }

    // Check all children for the paramter node
    ts.forEachChild(n, cb);
  }

  // Check the return type
  const nt = functionNode.type;
  if (nt) {
    // Check the return type node itself
    const { invalidNodes: invalidCheckNodes } = checkNode(nt, ctx);
    if (invalidCheckNodes) {
      myInvalidNodes = myInvalidNodes.concat(...invalidCheckNodes);
    }
    // Check all children for the return type node
    ts.forEachChild(nt, cb);
  }

  return myInvalidNodes;
}

export function shouldIgnore(
  node: ts.Node,
  options: IgnoreOption,
  sourceFile: ts.SourceFile
): boolean {
  // Check ignore for VariableLikeDeclaration, TypeAliasDeclaration
  if (
    node &&
    (isVariableLikeDeclaration(node) || utils.isTypeAliasDeclaration(node))
  ) {
    const variableText = node.name.getText(sourceFile);

    if (isIgnoredPrefix(variableText, options.ignorePrefix)) {
      return true;
    }
    if (isIgnoredExact(variableText, options.ignore)) {
      return true;
    }
    if (isIgnoredSuffix(variableText, options.ignoreSuffix)) {
      return true;
    }
  }
  return false;
}

export function isIgnored(
  node: ts.Node,
  ignorePrefix: Array<string> | string | undefined,
  ignoreExact: Array<string> | string | undefined,
  ignoreSuffix: Array<string> | string | undefined
): boolean {
  const nodeText = node.getText();

  if (
    isIgnoredPrefix(nodeText, ignorePrefix) ||
    isIgnoredExact(nodeText, ignoreExact) ||
    isIgnoredSuffix(nodeText, ignoreSuffix)
  ) {
    return true;
  }

  if (utils.isBinaryExpression(node)) {
    return isIgnored(node.left, ignorePrefix, ignoreExact, ignoreSuffix);
  }

  if (
    utils.isPrefixUnaryExpression(node) ||
    utils.isPostfixUnaryExpression(node)
  ) {
    return isIgnored(node.operand, ignorePrefix, ignoreExact, ignoreSuffix);
  }

  if (Object.prototype.hasOwnProperty.call(node, "expression")) {
    return isIgnored(
      // tslint:disable-next-line: no-any
      (node as any).expression,
      ignorePrefix,
      ignoreExact,
      ignoreSuffix
    );
  }

  return false;
}

function isIgnoredPrefix(
  text: string,
  ignorePrefix: Array<string> | string | undefined
): boolean {
  if (!ignorePrefix) {
    return false;
  }
  if (Array.isArray(ignorePrefix)) {
    if (ignorePrefix.find(pfx => text.indexOf(pfx) === 0)) {
      return true;
    }
  } else {
    if (text.indexOf(ignorePrefix) === 0) {
      return true;
    }
  }
  return false;
}

function isIgnoredSuffix(
  text: string,
  ignoreSuffix: Array<string> | string | undefined
): boolean {
  if (!ignoreSuffix) {
    return false;
  }
  if (Array.isArray(ignoreSuffix)) {
    if (
      ignoreSuffix.find(pfx => text.indexOf(pfx) === text.length - pfx.length)
    ) {
      return true;
    }
  } else {
    if (text.indexOf(ignoreSuffix) === text.length - ignoreSuffix.length) {
      return true;
    }
  }
  return false;
}

function isIgnoredExact(
  text: string,
  ignore: Array<string> | string | undefined
): boolean {
  if (!ignore) {
    return false;
  }
  if (Array.isArray(ignore)) {
    if (ignore.find(pfx => text === pfx)) {
      return true;
    }
  } else {
    if (text === ignore) {
      return true;
    }
  }
  return false;
}
