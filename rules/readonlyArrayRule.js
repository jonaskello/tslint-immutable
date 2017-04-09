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
        return this.applyWithFunction(sourceFile, walk, parseOptions(this.ruleArguments));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
Rule.FAILURE_STRING = "Only ReadonlyArray allowed.";
exports.Rule = Rule;
var OPTION_IGNORE_LOCAL = "ignore-local";
var OPTION_IGNORE_PREFIX = "ignore-prefix";
function parseOptions(options) {
    var ignoreLocal = options.indexOf(OPTION_IGNORE_LOCAL) !== -1;
    var ignorePrefix;
    for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
        var o = options_1[_i];
        if (typeof o === "object" && o[OPTION_IGNORE_PREFIX] != null) {
            ignorePrefix = o[OPTION_IGNORE_PREFIX];
            break;
        }
    }
    return { ignoreLocal: ignoreLocal, ignorePrefix: ignorePrefix };
}
function walk(ctx) {
    return ts.forEachChild(ctx.sourceFile, cb);
    function cb(node) {
        // Skip checking in functions if ignore-local is set
        if (ctx.options.ignoreLocal && (node.kind === ts.SyntaxKind.FunctionDeclaration || node.kind === ts.SyntaxKind.ArrowFunction)) {
            // We still need to check the parameters and return type
            var functionNode = node; //tslint:disable-line
            checkFunctionNode(functionNode, ctx);
            return;
        }
        // Check the node
        checkArrayTypeReference(node, ctx);
        checkArrayLiteralExpression(node, ctx);
        // Use return becuase performance hints docs say it optimizes the function using tail-call recursion
        return ts.forEachChild(node, cb);
    }
}
function checkFunctionNode(node, ctx) {
    // Check the parameters
    for (var _i = 0, _a = node.parameters; _i < _a.length; _i++) {
        var parameter = _a[_i];
        if (parameter.type) {
            // ArrayTypeReference
            checkArrayTypeReference(parameter.type, ctx);
        }
        else if (parameter.initializer) {
            // ArrayLiteral
            checkArrayLiteralExpression(parameter.initializer, ctx);
        }
    }
    // Check the return type
    if (node.type) {
        checkArrayTypeReference(node.type, ctx);
    }
}
function checkArrayTypeReference(node, ctx) {
    if (node.kind === ts.SyntaxKind.TypeReference) {
        var typeRefNode = node;
        if (typeRefNode.typeName.getText(ctx.sourceFile) === "Array") {
            if (ctx.options.ignorePrefix) {
                var variableDeclarationNode = node.parent;
                if (variableDeclarationNode.name.getText(ctx.sourceFile).substr(0, ctx.options.ignorePrefix.length) === ctx.options.ignorePrefix) {
                    return;
                }
            }
            ctx.addFailureAtNode(node, Rule.FAILURE_STRING);
        }
        return;
    }
}
function checkArrayLiteralExpression(node, ctx) {
    if (node.kind === ts.SyntaxKind.ArrayLiteralExpression) {
        // If the array literal is used in a variable declaration, the variable
        // must have a type spcecified, otherwise it will implicitly be of mutable Array type
        // It could also be a function parameter that has an array literal as default value
        if (node.parent && (node.parent.kind === ts.SyntaxKind.VariableDeclaration || node.parent.kind === ts.SyntaxKind.Parameter)) {
            var parent_1 = node.parent;
            if (!parent_1.type) {
                if (ctx.options.ignorePrefix &&
                    parent_1.name.getText(ctx.sourceFile).substr(0, ctx.options.ignorePrefix.length) === ctx.options.ignorePrefix) {
                    return;
                }
                var variableDeclarationNode = node.parent;
                ctx.addFailureAt(variableDeclarationNode.name.getStart(ctx.sourceFile), variableDeclarationNode.name.getWidth(ctx.sourceFile), Rule.FAILURE_STRING);
            }
        }
        return;
    }
}
