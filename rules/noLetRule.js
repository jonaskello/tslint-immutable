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
        var noLetWalker = new NoLetKeywordWalker(sourceFile, this.getOptions());
        return this.applyWithWalker(noLetWalker);
    };
    Rule.FAILURE_STRING = "Unexpected let, use const.";
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var NoLetKeywordWalker = (function (_super) {
    __extends(NoLetKeywordWalker, _super);
    function NoLetKeywordWalker() {
        _super.apply(this, arguments);
    }
    NoLetKeywordWalker.prototype.visitVariableStatement = function (node) {
        if (Lint.isNodeFlagSet(node.declarationList, ts.NodeFlags.Let)) {
            this.addFailure(this.createFailure(node.getStart(), "let".length, Rule.FAILURE_STRING));
        }
        _super.prototype.visitVariableStatement.call(this, node);
    };
    NoLetKeywordWalker.prototype.visitForStatement = function (node) {
        this.handleInitializerNode(node.initializer);
        _super.prototype.visitForStatement.call(this, node);
    };
    NoLetKeywordWalker.prototype.visitForInStatement = function (node) {
        this.handleInitializerNode(node.initializer);
        _super.prototype.visitForInStatement.call(this, node);
    };
    NoLetKeywordWalker.prototype.visitForOfStatement = function (node) {
        this.handleInitializerNode(node.initializer);
        _super.prototype.visitForOfStatement.call(this, node);
    };
    NoLetKeywordWalker.prototype.handleInitializerNode = function (node) {
        if (node && node.kind === ts.SyntaxKind.VariableDeclarationList &&
            (Lint.isNodeFlagSet(node, ts.NodeFlags.Let))) {
            this.addFailure(this.createFailure(node.getStart(), "let".length, Rule.FAILURE_STRING));
        }
    };
    return NoLetKeywordWalker;
}(Lint.RuleWalker));
