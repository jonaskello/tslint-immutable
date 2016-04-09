"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ts = require("typescript");
var Lint = require("tslint/lib/lint");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        _super.apply(this, arguments);
    }
    Rule.prototype.apply = function (sourceFile) {
        var noMutationWalker = new NoMutationWalker(sourceFile, this.getOptions());
        return this.applyWithWalker(noMutationWalker);
    };
    Rule.FAILURE_STRING = "No object mutation allowed.";
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var NoMutationWalker = (function (_super) {
    __extends(NoMutationWalker, _super);
    function NoMutationWalker() {
        _super.apply(this, arguments);
    }
    NoMutationWalker.prototype.visitNode = function (node) {
        if (node && node.kind === ts.SyntaxKind.BinaryExpression
            && node.getChildCount() >= 3
            && node.getChildAt(0).kind === ts.SyntaxKind.PropertyAccessExpression
            && node.getChildAt(1).kind === ts.SyntaxKind.FirstAssignment) {
            this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
        }
        _super.prototype.visitNode.call(this, node);
    };
    return NoMutationWalker;
}(Lint.RuleWalker));
//# sourceMappingURL=noMutationRule.js.map