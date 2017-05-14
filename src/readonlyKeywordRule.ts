import * as ts from "typescript";
import * as Lint from "tslint";
import * as Shared from "./readonly-shared";

/**
 * This rule checks that the readonly keyword is used in all PropertySignature and
 * IndexerSignature nodes (which are the only places that the readonly keyword can exist).
 */
export class Rule extends Lint.Rules.AbstractRule {
  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithFunction(
      sourceFile,
      (ctx: Lint.WalkContext<Shared.Options>) => Shared.walk(ctx, checkNode, "A readonly modifier is required."),
      Shared.parseOptions(this.ruleArguments));
  }
}

function checkNode(node: ts.Node, ctx: Lint.WalkContext<Shared.Options>): ReadonlyArray<Shared.InvalidNode> {
  return checkPropertySignatureAndIndexSignature(node, ctx);
}

function checkPropertySignatureAndIndexSignature(node: ts.Node, ctx: Lint.WalkContext<Shared.Options>): ReadonlyArray<Shared.InvalidNode> {

  if (node.kind === ts.SyntaxKind.PropertySignature || node.kind === ts.SyntaxKind.IndexSignature) {
    if (!(node.modifiers && node.modifiers.filter((m) => m.kind === ts.SyntaxKind.ReadonlyKeyword).length > 0)) {
      // Check if ignore-prefix applies
      if (Shared.shouldIgnorePrefix(node, ctx.options, ctx.sourceFile)) {
        return [];
      }
      const length = node.getWidth(ctx.sourceFile);
      // const fulltext = node.getText(ctx.sourceFile);
      const fulltext = node.getText(ctx.sourceFile);
      return [Shared.createInvalidNode(node, new Lint.Replacement(node.end - length, length, `readonly ${fulltext}`))];
    }
  }
  return [];

}
