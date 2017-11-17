import * as ts from "typescript";
import * as Lint from "tslint";

const OPTION_IGNORE_PREFIX = "ignore-prefix";

export interface Options {
  readonly ignorePrefix: string | string[] | undefined;
}

// tslint:disable-next-line:no-any
function parseOptions(options: any[]): Options {
  let ignorePrefix: string | undefined;
  for (const o of options) {
    if (typeof o === "object" && o[OPTION_IGNORE_PREFIX] !== null) {
      //tslint:disable-line
      ignorePrefix = o[OPTION_IGNORE_PREFIX];
      break;
    }
  }
  return { ignorePrefix };
}

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = "Using expressions to cause side-effects not allowed.";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const noExpressionStatementWalker = new NoExpressionStatementWalker(
      sourceFile,
      this.getOptions()
    );
    return this.applyWithWalker(noExpressionStatementWalker);
  }
}

class NoExpressionStatementWalker extends Lint.RuleWalker {
  ignorePrefix: string | string[] | undefined;

  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions) {
    super(sourceFile, options);
    Object.assign(this, parseOptions(options.ruleArguments));
  }

  public visitNode(node: ts.Node): void {
    if (node && node.kind === ts.SyntaxKind.ExpressionStatement) {
      const children = node.getChildren();
      const text = node.getText(this.getSourceFile());
      const isYield = children.every(
        (n: ts.Node) => n.kind === ts.SyntaxKind.YieldExpression
      );
      const isIgnored = this.isIgnored(text);
      if (!isYield && !isIgnored) {
        this.addFailure(
          this.createFailure(
            node.getStart(),
            node.getWidth(),
            Rule.FAILURE_STRING
          )
        );
      }
    }
    super.visitNode(node);
  }

  private isIgnored(text: string): boolean {
    if (!this.ignorePrefix) {
      return false;
    }
    if (Array.isArray(this.ignorePrefix)) {
      if (this.ignorePrefix.find(pfx => text.indexOf(pfx) === 0)) {
        return true;
      }
    } else {
      if (text.indexOf(this.ignorePrefix) === 0) {
        return true;
      }
    }
    return false;
  }
}
