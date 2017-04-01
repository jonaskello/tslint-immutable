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
        var walker = new SemicolonInterfaceWalker(sourceFile, this.getOptions());
        return this.applyWithWalker(walker);
    };
    return Rule;
}(Lint.Rules.AbstractRule));
Rule.FAILURE_STRING = "Use comma instead of semicolon in interfaces.";
exports.Rule = Rule;
var SemicolonInterfaceWalker = (function (_super) {
    __extends(SemicolonInterfaceWalker, _super);
    function SemicolonInterfaceWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SemicolonInterfaceWalker.prototype.visitInterfaceDeclaration = function (node) {
        var sourceFile = this.getSourceFile();
        for (var _i = 0, _a = node.members; _i < _a.length; _i++) {
            var member = _a[_i];
            var children = member.getChildren(sourceFile);
            var hasSemicolon = children.some(function (child) { return child.kind === ts.SyntaxKind.SemicolonToken; });
            if (hasSemicolon) {
                this.addFailure(this.createFailure(member.getStart(), member.getWidth(), Rule.FAILURE_STRING));
            }
        }
        _super.prototype.visitInterfaceDeclaration.call(this, node);
    };
    return SemicolonInterfaceWalker;
}(Lint.RuleWalker));
