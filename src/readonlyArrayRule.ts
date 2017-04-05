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
    if (ctx.options.ignoreLocal && (node.kind === ts.SyntaxKind.FunctionDeclaration || node.kind === ts.SyntaxKind.ArrowFunction)) {
      // skip checking in functions if ignore-local is set
      return;
    }
    if (node.kind === ts.SyntaxKind.TypeReference && isInvalidArrayTypeReference(node as ts.TypeReferenceNode, ctx)) {
      ctx.addFailureAtNode(node, Rule.FAILURE_STRING);
    }
    if (node.kind === ts.SyntaxKind.ArrayLiteralExpression && isInvalidArrayLiteralExpression(node as ts.ArrayLiteralExpression, ctx)) {
      const variableDeclarationNode = node.parent as ts.VariableDeclaration;
      ctx.addFailureAt(variableDeclarationNode.name.getStart(ctx.sourceFile), variableDeclarationNode.name.getWidth(ctx.sourceFile), Rule.FAILURE_STRING);
    }
    return ts.forEachChild(node, cb);
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
  if (node.parent && node.parent.kind === ts.SyntaxKind.VariableDeclaration) {
    const variableDeclarationNode = node.parent as ts.VariableDeclaration;
    if (!variableDeclarationNode.type) {
      if (ctx.options.ignorePrefix &&
        variableDeclarationNode.name.getText(ctx.sourceFile).substr(0, ctx.options.ignorePrefix.length) === ctx.options.ignorePrefix) {
        return false;
      }
      return true;
    }
  }
  return false;
}
