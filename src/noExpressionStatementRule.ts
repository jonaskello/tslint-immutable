import * as ts from "typescript";
import * as Lint from "tslint";
import {
  createInvalidNode,
  CheckNodeResult,
  createCheckNodeRule
} from "./shared/check-node";

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

// tslint:disable-next-line:variable-name
export const Rule = createCheckNodeRule(
  checkNode,
  "Using expressions to cause side-effects not allowed.",
  parseOptions
);

function checkNode(
  node: ts.Node,
  ctx: Lint.WalkContext<Options>
): CheckNodeResult {
  if (node && node.kind === ts.SyntaxKind.ExpressionStatement) {
    const children = node.getChildren();
    const text = node.getText(node.getSourceFile());
    const isYield = children.every(
      (n: ts.Node) => n.kind === ts.SyntaxKind.YieldExpression
    );
    const isIgnored2 = isIgnored(text, ctx.options.ignorePrefix);
    if (!isYield && !isIgnored2) {
      return { invalidNodes: [createInvalidNode(node)] };
    }
  }
  return { invalidNodes: [] };
}

// tslint:disable-next-line:no-any
function isIgnored(
  text: string,
  ignorePrefix: Array<string> | string | undefined
): boolean {
  if (!ignorePrefix) {
    return false;
  }
  if (Array.isArray(ignorePrefix)) {
    if (ignorePrefix.find(pfx => text.indexOf(pfx) === 0)) {
      return true;
    }
  } else {
    if (text.indexOf(ignorePrefix) === 0) {
      return true;
    }
  }
  return false;
}
