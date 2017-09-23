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
        var noThisKeywordWalker = new NoMethodSignatureWalker(sourceFile, this.getOptions());
        return this.applyWithWalker(noThisKeywordWalker);
    };
    return Rule;
}(Lint.Rules.AbstractRule));
Rule.FAILURE_STRING = "Method signature is mutable, use property signature with readonly modifier instead.";
exports.Rule = Rule;
var NoMethodSignatureWalker = (function (_super) {
    __extends(NoMethodSignatureWalker, _super);
    function NoMethodSignatureWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NoMethodSignatureWalker.prototype.visitNode = function (node) {
        if (node && node.kind === ts.SyntaxKind.MethodSignature) {
            this.addFailureAtNode(node, Rule.FAILURE_STRING);
        }
        _super.prototype.visitNode.call(this, node);
    };
    return NoMethodSignatureWalker;
}(Lint.RuleWalker));
