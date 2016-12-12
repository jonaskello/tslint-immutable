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
        var walker = new ReadonlyInterfaceWalker(sourceFile, this.getOptions());
        return this.applyWithWalker(walker);
    };
    return Rule;
}(Lint.Rules.AbstractRule));
Rule.FAILURE_STRING = "Interface members must have readonly modifier.";
Rule.FAILURE_STRING_ARRAY = "Interface members of array type must be ReadonlyArray.";
exports.Rule = Rule;
var ReadonlyInterfaceWalker = (function (_super) {
    __extends(ReadonlyInterfaceWalker, _super);
    function ReadonlyInterfaceWalker() {
        return _super.apply(this, arguments) || this;
    }
    ReadonlyInterfaceWalker.prototype.visitInterfaceDeclaration = function (node) {
        for (var _i = 0, _a = node.members; _i < _a.length; _i++) {
            var member = _a[_i];
            if (!(member.modifiers && member.modifiers.filter(function (m) { return m.kind === ts.SyntaxKind.ReadonlyKeyword; }).length > 0)) {
                this.addFailure(this.createFailure(member.getStart(), member.getWidth(), Rule.FAILURE_STRING));
            }
        }
        _super.prototype.visitInterfaceDeclaration.call(this, node);
    };
    return ReadonlyInterfaceWalker;
}(Lint.RuleWalker));
