import * as ts from "typescript";
import * as Lint from "tslint";

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = "Only ReadonlyArray allowed.";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk, parseOptions(this.ruleArguments));
  }

}

const OPTION_IGNORE_LOCAL = "ignore-local";
const OPTION_IGNORE_PREFIX = "ignore-prefix";

interface Options {
  ignoreLocal: boolean,
  ignorePrefix: string | undefined,
}

function parseOptions(options: any[]): Options { //tslint:disable-line
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

function walk(ctx: Lint.WalkContext<Options>): void {
  return ts.forEachChild(ctx.sourceFile, cb);
  function cb(node: ts.Node): void {
    // Skip checking in functions if ignore-local is set
    if (ctx.options.ignoreLocal && (node.kind === ts.SyntaxKind.FunctionDeclaration || node.kind === ts.SyntaxKind.ArrowFunction)) {
      // We still need to check the parameters and return type
      const functionNode: ts.FunctionDeclaration | ts.ArrowFunction = node as any; //tslint:disable-line
      checkIgnoreLocalFunctionNode(functionNode, ctx);
      return;
    }
    // Check the node
    checkNode(node, ctx);
    // Use return becuase performance hints docs say it optimizes the function using tail-call recursion
    return ts.forEachChild(node, cb);
  }
}

function checkNode(node: ts.Node, ctx: Lint.WalkContext<Options>): void {
  checkArrayTypeOrReference(node, ctx);
  checkVariableOrParameterImplicitType(node, ctx);
}

function checkIgnoreLocalFunctionNode(functionNode: ts.FunctionDeclaration | ts.ArrowFunction, ctx: Lint.WalkContext<Options>): void {

  // Check either the parameter's explicit type if it has one, or itself for implict type
  for (const n of functionNode.parameters.map((p) => p.type ? p.type : p)) {
    checkNode(n, ctx);
  }

  // Check the return type
  if (functionNode.type) {
    checkNode(functionNode.type, ctx);
  }

}

function checkArrayTypeOrReference(node: ts.Node, ctx: Lint.WalkContext<Options>): void {
  // We need to check both shorthand syntax "number[]" and type reference "Array<number>"
  if (node.kind === ts.SyntaxKind.ArrayType
    || (node.kind === ts.SyntaxKind.TypeReference && (node as ts.TypeReferenceNode).typeName.getText(ctx.sourceFile) === "Array")) {
    if (node.parent && shouldIgnorePrefix(node.parent, ctx.options, ctx.sourceFile)) {
      return;
    }
    ctx.addFailureAtNode(node, Rule.FAILURE_STRING);
  }
}

function checkVariableOrParameterImplicitType(node: ts.Node, ctx: Lint.WalkContext<Options>): void {

  if (node.kind === ts.SyntaxKind.VariableDeclaration || node.kind === ts.SyntaxKind.Parameter) {
    // The initializer is used to set and implicit type
    const varOrParamNode = node as ts.VariableDeclaration | ts.ParameterDeclaration;
    if (shouldIgnorePrefix(node, ctx.options, ctx.sourceFile)) {
      return;
    }
    if (!varOrParamNode.type) {
      if (varOrParamNode.initializer && varOrParamNode.initializer.kind === ts.SyntaxKind.ArrayLiteralExpression) {
        ctx.addFailureAtNode(varOrParamNode.name, Rule.FAILURE_STRING);
      }
    }
  }

}

function shouldIgnorePrefix(node: ts.Node, options: Options, sourceFile: ts.SourceFile): boolean {
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
