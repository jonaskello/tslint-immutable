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
        var walker = new ReadonlyIndexerWalker(sourceFile, this.getOptions());
        return this.applyWithWalker(walker);
    };
    return Rule;
}(Lint.Rules.AbstractRule));
Rule.FAILURE_STRING = "Indexers must be have readonly modifier.";
exports.Rule = Rule;
var ReadonlyIndexerWalker = (function (_super) {
    __extends(ReadonlyIndexerWalker, _super);
    function ReadonlyIndexerWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ReadonlyIndexerWalker.prototype.visitIndexSignatureDeclaration = function (node) {
        if (!(node.modifiers && node.modifiers.filter(function (m) { return m.kind === ts.SyntaxKind.ReadonlyKeyword; }).length > 0)) {
            this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
        }
        _super.prototype.visitIndexSignatureDeclaration.call(this, node);
    };
    return ReadonlyIndexerWalker;
}(Lint.RuleWalker));
