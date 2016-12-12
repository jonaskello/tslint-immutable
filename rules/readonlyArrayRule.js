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
        var walker = new ReadonlyArrayWalker(sourceFile, this.getOptions());
        return this.applyWithWalker(walker);
    };
    return Rule;
}(Lint.Rules.AbstractRule));
Rule.FAILURE_STRING = "Only ReadonlyArray allowed.";
exports.Rule = Rule;
var ReadonlyArrayWalker = (function (_super) {
    __extends(ReadonlyArrayWalker, _super);
    function ReadonlyArrayWalker() {
        return _super.apply(this, arguments) || this;
    }
    ReadonlyArrayWalker.prototype.visitTypeReference = function (node) {
        _super.prototype.visitTypeReference.call(this, node);
        if (node.typeName.getText() === "Array") {
            this.addFailure(this.createFailure(node.typeName.getStart(), node.typeName.getWidth(), Rule.FAILURE_STRING));
        }
    };
    ReadonlyArrayWalker.prototype.visitTypeLiteral = function (node) {
        _super.prototype.visitTypeLiteral.call(this, node);
        // if (node.kind === ts.SyntaxKind.ArrayType) {
        if (node.kind === ts.SyntaxKind.ArrayType) {
            this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
        }
    };
    return ReadonlyArrayWalker;
}(Lint.RuleWalker));
