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
var OPTION_IGNORE_PREFIX = "ignore-prefix";
function parseOptions(options) {
    var ignorePrefix;
    for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
        var o = options_1[_i];
        if (typeof o === "object" && o[OPTION_IGNORE_PREFIX] !== null) {
            ignorePrefix = o[OPTION_IGNORE_PREFIX];
            break;
        }
    }
    return { ignorePrefix: ignorePrefix };
}
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        var noExpressionStatementWalker = new NoExpressionStatementWalker(sourceFile, this.getOptions());
        return this.applyWithWalker(noExpressionStatementWalker);
    };
    return Rule;
}(Lint.Rules.AbstractRule));
Rule.FAILURE_STRING = "Using expressions to cause side-effects not allowed.";
exports.Rule = Rule;
var NoExpressionStatementWalker = (function (_super) {
    __extends(NoExpressionStatementWalker, _super);
    function NoExpressionStatementWalker(sourceFile, options) {
        var _this = _super.call(this, sourceFile, options) || this;
        Object.assign(_this, parseOptions(options.ruleArguments));
        return _this;
    }
    NoExpressionStatementWalker.prototype.visitNode = function (node) {
        if (node && node.kind === ts.SyntaxKind.ExpressionStatement) {
            var children = node.getChildren();
            var text = node.getText(this.getSourceFile());
            var isYield = children.every(function (n) { return n.kind === ts.SyntaxKind.YieldExpression; });
            var isIgnored = this.isIgnored(text);
            if (!isYield && !isIgnored) {
                this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
            }
        }
        _super.prototype.visitNode.call(this, node);
    };
    NoExpressionStatementWalker.prototype.isIgnored = function (text) {
        if (!this.ignorePrefix) {
            return false;
        }
        if (Array.isArray(this.ignorePrefix)) {
            if (this.ignorePrefix.find(function (pfx) { return text.indexOf(pfx) === 0; })) {
                return true;
            }
        }
        else {
            if (text.indexOf(this.ignorePrefix) === 0) {
                return true;
            }
        }
        return false;
    };
    return NoExpressionStatementWalker;
}(Lint.RuleWalker));
