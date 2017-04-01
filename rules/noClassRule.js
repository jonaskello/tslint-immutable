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
        var noClassKeywordWalker = new NoClassWalker(sourceFile, this.getOptions());
        return this.applyWithWalker(noClassKeywordWalker);
    };
    return Rule;
}(Lint.Rules.AbstractRule));
Rule.FAILURE_STRING = "Unexpected class, use functions not classes.";
exports.Rule = Rule;
var NoClassWalker = (function (_super) {
    __extends(NoClassWalker, _super);
    function NoClassWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NoClassWalker.prototype.visitNode = function (node) {
        if (node && node.kind === ts.SyntaxKind.ClassKeyword || node.kind === ts.SyntaxKind.ClassDeclaration) {
            this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
        }
        _super.prototype.visitNode.call(this, node);
    };
    return NoClassWalker;
}(Lint.RuleWalker));
