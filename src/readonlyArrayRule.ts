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
      // We still need to check the parameters which resides in the SyntaxList node
      for (const child1 of node.getChildren(ctx.sourceFile)) {
        if (child1.kind === ts.SyntaxKind.SyntaxList) {
          for (const child2 of child1.getChildren(ctx.sourceFile)) {
            if (child2.kind === ts.SyntaxKind.Parameter) {
              for (const child3 of child2.getChildren(ctx.sourceFile).filter((child) =>
                child.kind === ts.SyntaxKind.ArrayLiteralExpression || child.kind === ts.SyntaxKind.TypeReference)) {
                checkNode(child3, ctx);
              }
            }
          }
        }
      }
      return;
    }
    // Check the node
    checkNode(node, ctx);
    // Use return becuase performance hints docs say it optimizes the function using tail-call recursion
    return ts.forEachChild(node, cb);
  }
}

function checkNode(node: ts.Node, ctx: Lint.WalkContext<Options>) {
  if (node.kind === ts.SyntaxKind.TypeReference && isInvalidArrayTypeReference(node as ts.TypeReferenceNode, ctx)) {
    ctx.addFailureAtNode(node, Rule.FAILURE_STRING);
  }
  if (node.kind === ts.SyntaxKind.ArrayLiteralExpression && isInvalidArrayLiteralExpression(node as ts.ArrayLiteralExpression, ctx)) {
    const variableDeclarationNode = node.parent as ts.VariableDeclaration;
    ctx.addFailureAt(variableDeclarationNode.name.getStart(ctx.sourceFile), variableDeclarationNode.name.getWidth(ctx.sourceFile), Rule.FAILURE_STRING);
  }
}

function isInvalidArrayTypeReference(node: ts.TypeReferenceNode, ctx: Lint.WalkContext<Options>): boolean {
  if (node.typeName.getText(ctx.sourceFile) === "Array") {
    if (ctx.options.ignorePrefix) {
      const variableDeclarationNode = node.parent as ts.VariableDeclaration;
      if (variableDeclarationNode.name.getText(ctx.sourceFile).substr(0, ctx.options.ignorePrefix.length) === ctx.options.ignorePrefix) {
        return false;
      }
    }
    return true;
  }
  return false;
}

function isInvalidArrayLiteralExpression(node: ts.ArrayLiteralExpression, ctx: Lint.WalkContext<Options>): boolean {
  // If the array literal is used in a variable declaration, the variable
  // must have a type spcecified, otherwise it will implicitly be of mutable Array type
  // It could also be a function parameter that has an array literal as default value
  if (node.parent && (node.parent.kind === ts.SyntaxKind.VariableDeclaration || node.parent.kind === ts.SyntaxKind.Parameter)) {
    const parent = node.parent as ts.VariableDeclaration | ts.ParameterDeclaration;
    if (!parent.type) {
      if (ctx.options.ignorePrefix &&
        parent.name.getText(ctx.sourceFile).substr(0, ctx.options.ignorePrefix.length) === ctx.options.ignorePrefix) {
        return false;
      }
      return true;
    }
  }
  return false;
}
