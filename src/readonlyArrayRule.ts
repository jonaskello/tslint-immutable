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
    if (typeof o === "object" && o[OPTION_IGNORE_PREFIX] != null) {
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
    checkArrayTypeOrReference(node, ctx);
    // checkArrayLiteralExpression(node, ctx);
    checkVariableOrParameterImplicitType(node, ctx);
    // Use return becuase performance hints docs say it optimizes the function using tail-call recursion
    return ts.forEachChild(node, cb);
  }
}

function checkIgnoreLocalFunctionNode(node: ts.FunctionDeclaration | ts.ArrowFunction, ctx: Lint.WalkContext<Options>) {

  // Check the parameters
  for (const parameter of node.parameters) {
    if (parameter.type) {
      checkArrayTypeOrReference(parameter.type, ctx);
    }
    else {
      checkVariableOrParameterImplicitType(parameter, ctx);
    }
  }

  // Check the return type
  if (node.type) {
    checkArrayTypeOrReference(node.type, ctx);
  }

}

function checkArrayTypeOrReference(node: ts.Node, ctx: Lint.WalkContext<Options>) {
  // We need to check both shorthand syntax "number[]" and type reference "Array<number>"
  if (node.kind === ts.SyntaxKind.ArrayType
    || (node.kind === ts.SyntaxKind.TypeReference && (node as ts.TypeReferenceNode).typeName.getText(ctx.sourceFile) === "Array")) {
    if (node.parent && shouldIgnorePrefix(node.parent, ctx)) {
      return;
    }
    ctx.addFailureAtNode(node, Rule.FAILURE_STRING);
  }
}

function checkVariableOrParameterImplicitType(node: ts.Node, ctx: Lint.WalkContext<Options>) {

  if (node.kind === ts.SyntaxKind.VariableDeclaration || node.kind === ts.SyntaxKind.Parameter) {
    // The initializer is used to set and implicit type
    const varOrParamNode = node as ts.VariableDeclaration | ts.ParameterDeclaration;
    if (shouldIgnorePrefix(node, ctx)) {
      return;
    }
    if (!varOrParamNode.type) {
      if (varOrParamNode.initializer && varOrParamNode.initializer.kind === ts.SyntaxKind.ArrayLiteralExpression) {
        ctx.addFailureAtNode(varOrParamNode.name, Rule.FAILURE_STRING);
      }
    }
  }

}

function shouldIgnorePrefix(node: ts.Node, ctx: Lint.WalkContext<Options>): boolean {
  // Check ignore-prefix for VariableDeclaration, PropertySignature, TypeAliasDeclaration, Parameter
  if (ctx.options.ignorePrefix) {
    if (node && (node.kind === ts.SyntaxKind.VariableDeclaration
      || node.kind === ts.SyntaxKind.Parameter
      || node.kind === ts.SyntaxKind.PropertySignature
      || node.kind === ts.SyntaxKind.TypeAliasDeclaration)) {
      const variableDeclarationNode = node as ts.VariableDeclaration | ts.PropertySignature | ts.TypeAliasDeclaration | ts.ParameterDeclaration;
      if (variableDeclarationNode.name.getText(ctx.sourceFile).substr(0, ctx.options.ignorePrefix.length) === ctx.options.ignorePrefix) {
        return true;
      }
    }
  }
  return false;
}
