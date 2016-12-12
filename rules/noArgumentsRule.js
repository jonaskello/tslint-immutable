"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ts = require("typescript");
var Lint = require("tslint");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        var walker = new NoArgumentsWalker(sourceFile, this.getOptions());
        return this.applyWithWalker(walker);
    };
    return Rule;
}(Lint.Rules.AbstractRule));
Rule.FAILURE_STRING = "Use of arguments not allowed, name all parameters instead.";
exports.Rule = Rule;
var NoArgumentsWalker = (function (_super) {
    __extends(NoArgumentsWalker, _super);
    function NoArgumentsWalker() {
        return _super.apply(this, arguments) || this;
    }
    NoArgumentsWalker.prototype.visitNode = function (node) {
        if (node && node.kind === ts.SyntaxKind.Identifier && node.getText() === "arguments") {
            this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
        }
        _super.prototype.visitNode.call(this, node);
    };
    return NoArgumentsWalker;
}(Lint.RuleWalker));
