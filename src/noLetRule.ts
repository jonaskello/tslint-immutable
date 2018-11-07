import * as ts from "typescript";
import * as Lint from "tslint";
import * as Ignore from "./shared/ignore";
import {
  InvalidNode,
  createInvalidNode,
  CheckNodeResult,
  createCheckNodeRule
} from "./shared/check-node";

type Options = Ignore.IgnoreLocalOption & Ignore.IgnorePrefixOption;

// tslint:disable-next-line:variable-name
export const Rule = createCheckNodeRule(
  Ignore.checkNodeWithIgnore(checkNode),
  "Unexpected let, use const instead."
);

function checkNode(
  node: ts.Node,
  ctx: Lint.WalkContext<Options>
): CheckNodeResult {
  const variableStatementFailures = checkVariableStatement(node, ctx);
  const forStatementsFailures = checkForStatements(node, ctx);
  return {
    invalidNodes: [...variableStatementFailures, ...forStatementsFailures]
  };
}

function checkVariableStatement(
  node: ts.Node,
  ctx: Lint.WalkContext<Options>
): ReadonlyArray<InvalidNode> {
  if (ts.isVariableStatement(node)) {
    return checkDeclarationList(node.declarationList, ctx);
  }
  return [];
}

function checkForStatements(
  node: ts.Node,
  ctx: Lint.WalkContext<Options>
): ReadonlyArray<InvalidNode> {
  if (
    (ts.isForStatement(node) ||
      ts.isForInStatement(node) ||
      ts.isForOfStatement(node)) &&
    node.initializer &&
    ts.isVariableDeclarationList(node.initializer) &&
    Lint.isNodeFlagSet(node.initializer, ts.NodeFlags.Let)
  ) {
    return checkDeclarationList(node.initializer, ctx);
  }
  return [];
}

function checkDeclarationList(
  declarationList: ts.VariableDeclarationList,
  ctx: Lint.WalkContext<Options>
): ReadonlyArray<InvalidNode> {
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
        !Ignore.shouldIgnorePrefix(
          variableDeclarationNode,
          ctx.options,
          ctx.sourceFile
        )
      ) {
        invalidVariableDeclarationNodes.push(
          createInvalidNode(
            variableDeclarationNode,
            addFix
              ? [
                  new Lint.Replacement(
                    declarationList.getStart(ctx.sourceFile),
                    "let".length,
                    "const"
                  )
                ]
              : []
          )
        );
        addFix = false;
      }
    }
    return invalidVariableDeclarationNodes;
  }
  return [];
}
