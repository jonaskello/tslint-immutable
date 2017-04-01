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
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ReadonlyArrayWalker.prototype.visitTypeReference = function (node) {
        _super.prototype.visitTypeReference.call(this, node);
        if (node.typeName.getText() === "Array") {
            this.addFailure(this.createFailure(node.typeName.getStart(), node.typeName.getWidth(), Rule.FAILURE_STRING));
        }
    };
    ReadonlyArrayWalker.prototype.visitArrayLiteralExpression = function (node) {
        _super.prototype.visitArrayLiteralExpression.call(this, node);
        // If the array literal is used in a variable declaration, the variable
        // must have a type spcecified, otherwise it will implicitly be of mutable Array type
        if (node.parent && node.parent.kind === ts.SyntaxKind.VariableDeclaration) {
            var variableDeclarationNode = node.parent;
            var typeNode = variableDeclarationNode.type;
            if (!variableDeclarationNode.type) {
                this.addFailure(this.createFailure(variableDeclarationNode.name.getStart(), variableDeclarationNode.name.getWidth(), Rule.FAILURE_STRING));
            }
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
