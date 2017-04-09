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
      checkFunctionNode(functionNode, ctx);
      return;
    }
    // Check the node
    checkArrayTypeReference(node, ctx);
    checkArrayType(node, ctx);
    checkArrayLiteralExpression(node, ctx);
    // Use return becuase performance hints docs say it optimizes the function using tail-call recursion
    return ts.forEachChild(node, cb);
  }
}

function checkFunctionNode(node: ts.FunctionDeclaration | ts.ArrowFunction, ctx: Lint.WalkContext<Options>) {

  // Check the parameters
  for (const parameter of node.parameters) {
    if (parameter.type) {
      checkArrayTypeReference(parameter.type, ctx);
      checkArrayType(parameter.type, ctx);
    }
    else if (parameter.initializer) {
      checkArrayLiteralExpression(parameter.initializer, ctx);
    }
  }

  // Check the return type
  if (node.type) {
    checkArrayTypeReference(node.type, ctx);
  }

}

function checkArrayType(node: ts.Node, ctx: Lint.WalkContext<Options>) {
  if (node.kind === ts.SyntaxKind.ArrayType) {
    if (ctx.options.ignorePrefix) {
      const variableDeclarationNode = node.parent as ts.VariableDeclaration;
      if (variableDeclarationNode.name.getText(ctx.sourceFile).substr(0, ctx.options.ignorePrefix.length) === ctx.options.ignorePrefix) {
        return;
      }
    }
    ctx.addFailureAtNode(node, Rule.FAILURE_STRING);
    return;
  }
}

function checkArrayTypeReference(node: ts.Node, ctx: Lint.WalkContext<Options>) {
  if (node.kind === ts.SyntaxKind.TypeReference) {
    const typeRefNode = node as ts.TypeReferenceNode;
    if (typeRefNode.typeName.getText(ctx.sourceFile) === "Array") {
      if (ctx.options.ignorePrefix) {
        const variableDeclarationNode = node.parent as ts.VariableDeclaration;
        if (variableDeclarationNode.name.getText(ctx.sourceFile).substr(0, ctx.options.ignorePrefix.length) === ctx.options.ignorePrefix) {
          return;
        }
      }
      ctx.addFailureAtNode(node, Rule.FAILURE_STRING);
    }
    return;
  }
}

function checkArrayLiteralExpression(node: ts.Node, ctx: Lint.WalkContext<Options>) {
  if (node.kind === ts.SyntaxKind.ArrayLiteralExpression) {
    // If the array literal is used in a variable declaration, the variable
    // must have a type spcecified, otherwise it will implicitly be of mutable Array type
    // It could also be a function parameter that has an array literal as default value
    if (node.parent && (node.parent.kind === ts.SyntaxKind.VariableDeclaration || node.parent.kind === ts.SyntaxKind.Parameter)) {
      const parent = node.parent as ts.VariableDeclaration | ts.ParameterDeclaration;
      if (!parent.type) {
        if (ctx.options.ignorePrefix &&
          parent.name.getText(ctx.sourceFile).substr(0, ctx.options.ignorePrefix.length) === ctx.options.ignorePrefix) {
          return;
        }
        const variableDeclarationNode = node.parent as ts.VariableDeclaration;
        ctx.addFailureAtNode(variableDeclarationNode.name, Rule.FAILURE_STRING);
      }
    }
    return;
  }
}
