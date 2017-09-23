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
        var noObjectMutationWalker = new NoObjectMutationWalker(sourceFile, this.getOptions());
        return this.applyWithWalker(noObjectMutationWalker);
    };
    return Rule;
}(Lint.Rules.AbstractRule));
Rule.FAILURE_STRING = "Modifying properties of existing object not allowed.";
exports.Rule = Rule;
var objPropAccessors = [
    ts.SyntaxKind.ElementAccessExpression,
    ts.SyntaxKind.PropertyAccessExpression
];
var forbidObjPropOnLeftSideOf = [
    ts.SyntaxKind.EqualsToken,
    ts.SyntaxKind.PlusEqualsToken,
    ts.SyntaxKind.MinusEqualsToken,
    ts.SyntaxKind.AsteriskEqualsToken,
    ts.SyntaxKind.AsteriskAsteriskEqualsToken,
    ts.SyntaxKind.SlashEqualsToken,
    ts.SyntaxKind.PercentEqualsToken,
    ts.SyntaxKind.LessThanLessThanEqualsToken,
    ts.SyntaxKind.GreaterThanGreaterThanEqualsToken,
    ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken,
    ts.SyntaxKind.AmpersandEqualsToken,
    ts.SyntaxKind.BarEqualsToken,
    ts.SyntaxKind.CaretEqualsToken
];
var forbidUnaryOps = [
    ts.SyntaxKind.PlusPlusToken,
    ts.SyntaxKind.MinusMinusToken
];
var NoObjectMutationWalker = (function (_super) {
    __extends(NoObjectMutationWalker, _super);
    function NoObjectMutationWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NoObjectMutationWalker.prototype.visitNode = function (node) {
        // No assignment with object.property on the left
        if (node && node.kind === ts.SyntaxKind.BinaryExpression) {
            var binExp_1 = node;
            if (objPropAccessors.some(function (k) { return k === binExp_1.left.kind; }) &&
                forbidObjPropOnLeftSideOf.some(function (k) { return k === binExp_1.operatorToken.kind; })) {
                this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
            }
        }
        // No deleting object properties
        if (node && node.kind === ts.SyntaxKind.DeleteExpression) {
            var delExp_1 = node;
            if (objPropAccessors.some(function (k) { return k === delExp_1.expression.kind; })) {
                this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
            }
        }
        // No prefix inc/dec
        if (node && node.kind === ts.SyntaxKind.PrefixUnaryExpression) {
            var preExp_1 = node;
            if (objPropAccessors.some(function (k) { return k === preExp_1.operand.kind; }) &&
                forbidUnaryOps.some(function (o) { return o === preExp_1.operator; })) {
                this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
            }
        }
        // No postfix inc/dec
        if (node && node.kind === ts.SyntaxKind.PostfixUnaryExpression) {
            var postExp_1 = node;
            if (objPropAccessors.some(function (k) { return k === postExp_1.operand.kind; }) &&
                forbidUnaryOps.some(function (o) { return o === postExp_1.operator; })) {
                this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
            }
        }
        _super.prototype.visitNode.call(this, node);
    };
    return NoObjectMutationWalker;
}(Lint.RuleWalker));
