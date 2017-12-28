/**
 * This file has functions that enable walking the nodes
 * and just providing a CheckNodeFunction that returns invalid
 * nodes. It enables a more functional style of programming rules
 * using the CheckNodeFunction as an expression that returns errors.
 */

import * as ts from "typescript";
import * as Lint from "tslint";

export interface CheckNodeFunction<TOptions> {
  (node: ts.Node, ctx: Lint.WalkContext<TOptions>): CheckNodeResult;
}

export interface InvalidNode {
  readonly node: ts.Node;
  readonly replacement: Lint.Replacement | undefined;
}

export function createInvalidNode(
  node: ts.Node,
  replacement?: Lint.Replacement
): InvalidNode {
  return { node, replacement };
}

export interface CheckNodeResult {
  invalidNodes: ReadonlyArray<InvalidNode>;
  skipBranch?: boolean;
}

export function walk<TOptions>(
  ctx: Lint.WalkContext<TOptions>,
  checkNode: CheckNodeFunction<TOptions>,
  failureString: string
): void {
  return ts.forEachChild(ctx.sourceFile, cb);

  function cb(node: ts.Node): void {
    // Check the node
    const { invalidNodes, skipBranch } = checkNode(node, ctx);
    reportInvalidNodes(invalidNodes, ctx, failureString);
    if (skipBranch) {
      return;
    }
    // Use return becuase performance hints docs say it optimizes the function using tail-call recursion
    return ts.forEachChild(node, cb);
  }
}

export function createCheckNodeRule<TOptions>(
  checkNode: CheckNodeFunction<TOptions>,
  failureString: string,
  // tslint:disable-next-line:no-any
  parseOptions: (ruleArguments: any[]) => TOptions = () => ({} as any)
  // tslint:disable-next-line:no-any
): any {
  return class Rule extends Lint.Rules.AbstractRule {
    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
      return this.applyWithFunction(
        sourceFile,
        (ctx: Lint.WalkContext<TOptions>) =>
          walk(ctx, checkNode, failureString),
        parseOptions(this.ruleArguments)
      );
    }
  };
}

function reportInvalidNodes<TOptions>(
  invalidNodes: ReadonlyArray<InvalidNode>,
  ctx: Lint.WalkContext<TOptions>,
  failureString: string
): void {
  invalidNodes.forEach(invalidNode =>
    ctx.addFailureAtNode(
      invalidNode.node,
      failureString,
      invalidNode.replacement
    )
  );
}
