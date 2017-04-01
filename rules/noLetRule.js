"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var Lint = require("tslint");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        var noLetWalker = new NoLetKeywordWalker(sourceFile, this.getOptions());
        return this.applyWithWalker(noLetWalker);
    };
    return Rule;
}(Lint.Rules.AbstractRule));
Rule.FAILURE_STRING = "Unexpected let, use const.";
exports.Rule = Rule;
var NoLetKeywordWalker = (function (_super) {
    __extends(NoLetKeywordWalker, _super);
    function NoLetKeywordWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
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
