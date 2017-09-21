/**
 * This file has code that is shared for all the readonly rules.
 * It supports the options for ignore-local and ignore-prefix which all readonly rules have.
 * The rules ony need to provide a checker function.
 */

import * as ts from "typescript";
import * as Lint from "tslint";

const OPTION_IGNORE_LOCAL = "ignore-local";
const OPTION_IGNORE_PREFIX = "ignore-prefix";

export interface CheckNodeFunction {
  (node: ts.Node, ctx: Lint.WalkContext<Options>): ReadonlyArray<InvalidNode>
}

export interface Options {
  readonly ignoreLocal: boolean,
  readonly ignorePrefix: string | undefined,
}

export interface InvalidNode {
  readonly node: ts.Node,
  readonly replacement: Lint.Replacement | undefined,
}

export function createInvalidNode(node: ts.Node, replacement?: Lint.Replacement): InvalidNode {
  return { node, replacement };
}

export function parseOptions(options: any[]): Options { //tslint:disable-line
  const ignoreLocal = options.indexOf(OPTION_IGNORE_LOCAL) !== -1;
  let ignorePrefix: string | undefined;
  for (const o of options) {
    if (typeof o === "object" && o[OPTION_IGNORE_PREFIX] !== null) { //tslint:disable-line
      ignorePrefix = o[OPTION_IGNORE_PREFIX];
      break;
    }
  }
  return { ignoreLocal, ignorePrefix };
}

export function walk(ctx: Lint.WalkContext<Options>, checkNode: CheckNodeFunction, failureString: string): void {
  return ts.forEachChild(ctx.sourceFile, cb);
  function cb(node: ts.Node): void {
    // Skip checking in functions if ignore-local is set
    if (ctx.options.ignoreLocal && (node.kind === ts.SyntaxKind.FunctionDeclaration
      || node.kind === ts.SyntaxKind.ArrowFunction || node.kind === ts.SyntaxKind.FunctionExpression
      || node.kind === ts.SyntaxKind.MethodDeclaration)) {
      // We still need to check the parameters and return type
      const functionNode: ts.FunctionDeclaration | ts.ArrowFunction | ts.MethodDeclaration = node as any; //tslint:disable-line
      const invalidNodes = checkIgnoreLocalFunctionNode(functionNode, ctx, checkNode);
      // invalidNodes.forEach((n) => reportInvalidNodes(n, ctx, failureString));
      reportInvalidNodes(invalidNodes, ctx, failureString);
      // Now skip this whole branch
      return;
    }
    // Check the node
    reportInvalidNodes(checkNode(node, ctx), ctx, failureString);
    // Use return becuase performance hints docs say it optimizes the function using tail-call recursion
    return ts.forEachChild(node, cb);
  }
}

export function reportInvalidNodes(invalidNodes: ReadonlyArray<InvalidNode>, ctx: Lint.WalkContext<Options>, failureString: string): void {
  invalidNodes.forEach((invalidNode) => ctx.addFailureAtNode(invalidNode.node, failureString, invalidNode.replacement));
}

export function checkIgnoreLocalFunctionNode(functionNode: ts.FunctionDeclaration | ts.ArrowFunction | ts.MethodDeclaration,
  ctx: Lint.WalkContext<Options>, checkNode: CheckNodeFunction): ReadonlyArray<InvalidNode> {

  let invalidNodes: Array<InvalidNode> = [];

  // Check either the parameter's explicit type if it has one, or itself for implict type
  for (const n of functionNode.parameters.map((p) => p.type ? p.type : p)) {
    const invalidCheckNodes = checkNode(n, ctx);
    if (invalidCheckNodes) {
      invalidNodes = invalidNodes.concat(...invalidCheckNodes);
    }
  }

  // Check the return type
  if (functionNode.type) {
    const invalidCheckNodes = checkNode(functionNode.type, ctx);
    if (invalidCheckNodes) {
      invalidNodes = invalidNodes.concat(...invalidCheckNodes);
    }
  }

  return invalidNodes;

}

export function shouldIgnorePrefix(node: ts.Node, options: Options, sourceFile: ts.SourceFile): boolean {
  // Check ignore-prefix for VariableDeclaration, PropertySignature, TypeAliasDeclaration, Parameter
  if (options.ignorePrefix) {
    if (node && (node.kind === ts.SyntaxKind.VariableDeclaration
      || node.kind === ts.SyntaxKind.Parameter
      || node.kind === ts.SyntaxKind.PropertySignature
      || node.kind === ts.SyntaxKind.TypeAliasDeclaration)) {
      const variableDeclarationNode = node as ts.VariableDeclaration | ts.PropertySignature | ts.TypeAliasDeclaration | ts.ParameterDeclaration;
      if (variableDeclarationNode.name.getText(sourceFile).substr(0, options.ignorePrefix.length) === options.ignorePrefix) {
        return true;
      }
    }
  }
  return false;
}
