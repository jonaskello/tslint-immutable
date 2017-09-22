import * as ts from "typescript";
import * as Lint from "tslint";
import * as Shared from "./readonly-shared";

export class Rule extends Lint.Rules.AbstractRule {
  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithFunction(
      sourceFile,
      (ctx: Lint.WalkContext<Shared.Options>) =>
        Shared.walk(ctx, checkNode, "Unexpected let, use const instead."),
      Shared.parseOptions(this.ruleArguments)
    );
  }
}

function checkNode(
  node: ts.Node,
  ctx: Lint.WalkContext<Shared.Options>
): ReadonlyArray<Shared.InvalidNode> {
  const variableStatementFailures = chectVariableStatement(node, ctx);
  const forStatementsFailures = checkForStatements(node, ctx);
  return [...variableStatementFailures, ...forStatementsFailures];
}

function chectVariableStatement(
  node: ts.Node,
  ctx: Lint.WalkContext<Shared.Options>
): ReadonlyArray<Shared.InvalidNode> {
  if (node.kind === ts.SyntaxKind.VariableStatement) {
    const variableStatementNode: ts.VariableStatement = node as ts.VariableStatement;
    return checkDeclarationList(variableStatementNode.declarationList, ctx);
  }
  return [];
}

function checkForStatements(
  node: ts.Node,
  ctx: Lint.WalkContext<Shared.Options>
): ReadonlyArray<Shared.InvalidNode> {
  if (
    node.kind === ts.SyntaxKind.ForStatement ||
    node.kind === ts.SyntaxKind.ForInStatement ||
    node.kind === ts.SyntaxKind.ForOfStatement
  ) {
    const forStatmentNode = node as
      | ts.ForStatement
      | ts.ForInStatement
      | ts.ForOfStatement;
    if (
      forStatmentNode.initializer &&
      forStatmentNode.initializer.kind ===
        ts.SyntaxKind.VariableDeclarationList &&
      Lint.isNodeFlagSet(forStatmentNode.initializer, ts.NodeFlags.Let)
    ) {
      const declarationList = forStatmentNode.initializer as ts.VariableDeclarationList;
      return checkDeclarationList(declarationList, ctx);
    }
  }
  return [];
}

function checkDeclarationList(
  declarationList: ts.VariableDeclarationList,
  ctx: Lint.WalkContext<Shared.Options>
): ReadonlyArray<Shared.InvalidNode> {
  if (Lint.isNodeFlagSet(declarationList, ts.NodeFlags.Let)) {
    // It is a let declaration, now check each variable that is declared
    const invalidVariableDeclarationNodes = [];
    // If the declaration list contains multiple variables, eg. let x = 0, y = 1, mutableZ = 3; then
    // we should only provide one fix for the list even if two variables are invalid.
    // NOTE: When we have a mix of allowed and disallowed variables in the same DeclarationList
    // there is no sure way to know if we should do a fix or not, eg. if ignore-prefix=mutable
    // and the list is "let x, mutableZ", then "x" is invalid but "mutableZ" is valid, should we change
    // "let" to "const" or not? For now we change to const if at least one variable is invalid.
    let addFix = true;
    for (const variableDeclarationNode of declarationList.declarations) {
      if (
        !Shared.shouldIgnorePrefix(
          variableDeclarationNode,
          ctx.options,
          ctx.sourceFile
        )
      ) {
        invalidVariableDeclarationNodes.push(
          Shared.createInvalidNode(
            variableDeclarationNode,
            addFix
              ? new Lint.Replacement(
                  declarationList.getStart(ctx.sourceFile),
                  "let".length,
                  "const"
                )
              : undefined
          )
        );
        addFix = false;
      }
    }
    return invalidVariableDeclarationNodes;
  }
  return [];
}
