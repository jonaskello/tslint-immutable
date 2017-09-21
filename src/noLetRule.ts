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
    if (
      node.parent &&
      Shared.shouldIgnorePrefix(node.parent, ctx.options, ctx.sourceFile)
    ) {
      return [];
    }
    const variableStatementNode: ts.VariableStatement = node as ts.VariableStatement;
    if (
      Lint.isNodeFlagSet(
        variableStatementNode.declarationList,
        ts.NodeFlags.Let
      )
    ) {
      return [
        Shared.createInvalidNode(
          variableStatementNode,
          new Lint.Replacement(0, "let".length, "const")
        )
      ];
    }
  }

  return [];

  // if (Lint.isNodeFlagSet(node.declarationList, ts.NodeFlags.Let)) {
  //   this.addFailure(
  //     this.createFailure(node.getStart(), "let".length, Rule.FAILURE_STRING)
  //   );
  // }

  // super.visitVariableStatement(node);
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
    if (forStatmentNode.initializer === undefined) {
      return [];
    }
    return handleInitializerNode(forStatmentNode.initializer, ctx);
  }
  return [];
}

function handleInitializerNode(
  node: ts.ForInitializer,
  ctx: Lint.WalkContext<Shared.Options>
): ReadonlyArray<Shared.InvalidNode> {
  if (
    node &&
    node.kind === ts.SyntaxKind.VariableDeclarationList &&
    Lint.isNodeFlagSet(node, ts.NodeFlags.Let)
  ) {
    // this.addFailure(
    //   this.createFailure(node.getStart(), "let".length, Rule.FAILURE_STRING)
    // );

    return [
      Shared.createInvalidNode(
        node,
        new Lint.Replacement(0, "let".length, "const")
      )
    ];
  }
  return [];
}

/*
export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = "Unexpected let, use const.";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const noLetWalker = new NoLetKeywordWalker(sourceFile, this.getOptions());
    return this.applyWithWalker(noLetWalker);
  }
}

class NoLetKeywordWalker extends Lint.RuleWalker {
  public visitVariableStatement(node: ts.VariableStatement): void {
    if (Lint.isNodeFlagSet(node.declarationList, ts.NodeFlags.Let)) {
      this.addFailure(
        this.createFailure(node.getStart(), "let".length, Rule.FAILURE_STRING)
      );
    }

    super.visitVariableStatement(node);
  }

  public visitForStatement(node: ts.ForStatement): void {
    this.handleInitializerNode(node.initializer!);
    super.visitForStatement(node);
  }

  public visitForInStatement(node: ts.ForInStatement): void {
    this.handleInitializerNode(node.initializer);
    super.visitForInStatement(node);
  }

  public visitForOfStatement(node: ts.ForOfStatement): void {
    this.handleInitializerNode(node.initializer);
    super.visitForOfStatement(node);
  }

  private handleInitializerNode(
    node: ts.VariableDeclarationList | ts.Expression
  ): void {
    if (
      node &&
      node.kind === ts.SyntaxKind.VariableDeclarationList &&
      Lint.isNodeFlagSet(node, ts.NodeFlags.Let)
    ) {
      this.addFailure(
        this.createFailure(node.getStart(), "let".length, Rule.FAILURE_STRING)
      );
    }
  }
}
*/
