/**
 * This file has code that is shared for all the readonly rules.
 * It supports the options for ignore-local and ignore-prefix which all readonly rules have.
 * The rules ony need to provide a checker function.
 */

import * as ts from "typescript";
import * as Lint from "tslint";
import * as Shared from "./shared";
import { CheckNodeFunction } from "./shared";

const OPTION_IGNORE_LOCAL = "ignore-local";
const OPTION_IGNORE_CLASS = "ignore-class";
const OPTION_IGNORE_INTERFACE = "ignore-interface";
const OPTION_IGNORE_PREFIX = "ignore-prefix";

export interface Options {
  readonly ignoreLocal: boolean;
  readonly ignoreClass: boolean;
  readonly ignoreInterface: boolean;
  readonly ignorePrefix: string | undefined;
}

//tslint:disable-next-line
export function parseOptions(options: any[]): Options {
  const ignoreLocal = options.indexOf(OPTION_IGNORE_LOCAL) !== -1;
  const ignoreClass = options.indexOf(OPTION_IGNORE_CLASS) !== -1;
  const ignoreInterface = options.indexOf(OPTION_IGNORE_INTERFACE) !== -1;
  let ignorePrefix: string | undefined;
  for (const o of options) {
    //tslint:disable-next-line
    if (typeof o === "object" && o[OPTION_IGNORE_PREFIX] !== null) {
      //tslint:disable-line
      ignorePrefix = o[OPTION_IGNORE_PREFIX];
      break;
    }
  }
  return { ignoreLocal, ignoreClass, ignoreInterface, ignorePrefix };
}
/*
export function walk(
  ctx: Lint.WalkContext<Options>,
  checkNode: Shared.CheckNodeFunction<Options>,
  failureString: string
): void {
  return ts.forEachChild(ctx.sourceFile, cb);
  function cb(node: ts.Node): void {
    // Skip checking in functions if ignore-local is set
    if (
      ctx.options.ignoreLocal &&
      (node.kind === ts.SyntaxKind.FunctionDeclaration ||
        node.kind === ts.SyntaxKind.ArrowFunction ||
        node.kind === ts.SyntaxKind.FunctionExpression ||
        node.kind === ts.SyntaxKind.MethodDeclaration)
    ) {
      // We still need to check the parameters and return type
      const functionNode:
        | ts.FunctionDeclaration
        | ts.ArrowFunction
        | ts.MethodDeclaration = node as any; //tslint:disable-line
      const invalidNodes = checkIgnoreLocalFunctionNode(
        functionNode,
        ctx,
        checkNode
      );
      // invalidNodes.forEach((n) => reportInvalidNodes(n, ctx, failureString));
      Shared.reportInvalidNodes(invalidNodes, ctx, failureString);
      // Now skip this whole branch
      return;
    }

    // Skip checking in classes/interfaces if ignore-class/ignore-interface is set
    if (
      (ctx.options.ignoreClass &&
        node.kind === ts.SyntaxKind.PropertyDeclaration) ||
      (ctx.options.ignoreInterface &&
        node.kind === ts.SyntaxKind.PropertySignature)
    ) {
      return;
    }

    // Check the node
    Shared.reportInvalidNodes(checkNode(node, ctx), ctx, failureString);
    // Use return becuase performance hints docs say it optimizes the function using tail-call recursion
    return ts.forEachChild(node, cb);
  }
}
*/

export function checkNodeWithIgnore(
  checkNode: CheckNodeFunction<Options>
): CheckNodeFunction<Options> {
  return (node: ts.Node, ctx: Lint.WalkContext<Options>) => {
    // Skip checking in functions if ignore-local is set
    if (
      ctx.options.ignoreLocal &&
      (node.kind === ts.SyntaxKind.FunctionDeclaration ||
        node.kind === ts.SyntaxKind.ArrowFunction ||
        node.kind === ts.SyntaxKind.FunctionExpression ||
        node.kind === ts.SyntaxKind.MethodDeclaration)
    ) {
      // We still need to check the parameters and return type
      const functionNode:
        | ts.FunctionDeclaration
        | ts.ArrowFunction
        | ts.MethodDeclaration = node as any; //tslint:disable-line
      const invalidNodes = checkIgnoreLocalFunctionNode(
        functionNode,
        ctx,
        checkNode
      );
      // Now skip this whole branch
      return { invalidNodes, skipBranch: true };
    }

    // Skip checking in classes/interfaces if ignore-class/ignore-interface is set
    if (
      (ctx.options.ignoreClass &&
        node.kind === ts.SyntaxKind.PropertyDeclaration) ||
      (ctx.options.ignoreInterface &&
        node.kind === ts.SyntaxKind.PropertySignature)
    ) {
      // Now skip this whole branch
      return { invalidNodes: [], skipBranch: true };
    }

    // Forward to check node
    return checkNode(node, ctx);
  };
}

export const walkWithIgnore = (
  ctx: Lint.WalkContext<Options>,
  checkNode: Shared.CheckNodeFunction<Options>,
  failureString: string
): void => {
  const withIgnore = checkNodeWithIgnore(checkNode);
  return Shared.walk(ctx, withIgnore, failureString);
};

export function checkIgnoreLocalFunctionNode(
  functionNode:
    | ts.FunctionDeclaration
    | ts.ArrowFunction
    | ts.MethodDeclaration,
  ctx: Lint.WalkContext<Options>,
  checkNode: Shared.CheckNodeFunction<Options>
): ReadonlyArray<Shared.InvalidNode> {
  let myInvalidNodes: Array<Shared.InvalidNode> = [];

  // Check either the parameter's explicit type if it has one, or itself for implict type
  for (const n of functionNode.parameters.map(p => (p.type ? p.type : p))) {
    const { invalidNodes: invalidCheckNodes } = checkNode(n, ctx);
    if (invalidCheckNodes) {
      myInvalidNodes = myInvalidNodes.concat(...invalidCheckNodes);
    }
  }

  // Check the return type
  if (functionNode.type) {
    const { invalidNodes: invalidCheckNodes } = checkNode(
      functionNode.type,
      ctx
    );
    if (invalidCheckNodes) {
      myInvalidNodes = myInvalidNodes.concat(...invalidCheckNodes);
    }
  }

  return myInvalidNodes;
}

export function shouldIgnorePrefix(
  node: ts.Node,
  options: Options,
  sourceFile: ts.SourceFile
): boolean {
  // Check ignore-prefix for VariableDeclaration, PropertySignature, TypeAliasDeclaration, Parameter
  if (options.ignorePrefix) {
    if (
      node &&
      (node.kind === ts.SyntaxKind.VariableDeclaration ||
        node.kind === ts.SyntaxKind.Parameter ||
        node.kind === ts.SyntaxKind.PropertySignature ||
        node.kind === ts.SyntaxKind.PropertyDeclaration ||
        node.kind === ts.SyntaxKind.TypeAliasDeclaration)
    ) {
      const variableDeclarationNode = node as
        | ts.VariableDeclaration
        | ts.PropertySignature
        | ts.TypeAliasDeclaration
        | ts.ParameterDeclaration;
      if (
        variableDeclarationNode.name
          .getText(sourceFile)
          .substr(0, options.ignorePrefix.length) === options.ignorePrefix
      ) {
        return true;
      }
    }
  }
  return false;
}
