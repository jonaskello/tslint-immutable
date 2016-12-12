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
        var walker = new NoLabelsWalker(sourceFile, this.getOptions());
        return this.applyWithWalker(walker);
    };
    return Rule;
}(Lint.Rules.AbstractRule));
Rule.FAILURE_STRING = "Do not use labels.";
exports.Rule = Rule;
var NoLabelsWalker = (function (_super) {
    __extends(NoLabelsWalker, _super);
    function NoLabelsWalker() {
        return _super.apply(this, arguments) || this;
    }
    NoLabelsWalker.prototype.visitNode = function (node) {
        if (node && node.kind === ts.SyntaxKind.LabeledStatement) {
            this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
        }
        _super.prototype.visitNode.call(this, node);
    };
    return NoLabelsWalker;
}(Lint.RuleWalker));
