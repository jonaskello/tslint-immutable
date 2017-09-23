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
var Shared = require("./readonly-shared");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithFunction(sourceFile, function (ctx) {
            return Shared.walk(ctx, checkNode, "Unexpected let, use const instead.");
        }, Shared.parseOptions(this.ruleArguments));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
function checkNode(node, ctx) {
    var variableStatementFailures = chectVariableStatement(node, ctx);
    var forStatementsFailures = checkForStatements(node, ctx);
    return variableStatementFailures.concat(forStatementsFailures);
}
function chectVariableStatement(node, ctx) {
    if (node.kind === ts.SyntaxKind.VariableStatement) {
        var variableStatementNode = node;
        return checkDeclarationList(variableStatementNode.declarationList, ctx);
    }
    return [];
}
function checkForStatements(node, ctx) {
    if (node.kind === ts.SyntaxKind.ForStatement ||
        node.kind === ts.SyntaxKind.ForInStatement ||
        node.kind === ts.SyntaxKind.ForOfStatement) {
        var forStatmentNode = node;
        if (forStatmentNode.initializer &&
            forStatmentNode.initializer.kind ===
                ts.SyntaxKind.VariableDeclarationList &&
            Lint.isNodeFlagSet(forStatmentNode.initializer, ts.NodeFlags.Let)) {
            var declarationList = forStatmentNode.initializer;
            return checkDeclarationList(declarationList, ctx);
        }
    }
    return [];
}
function checkDeclarationList(declarationList, ctx) {
    if (Lint.isNodeFlagSet(declarationList, ts.NodeFlags.Let)) {
        // It is a let declaration, now check each variable that is declared
        var invalidVariableDeclarationNodes = [];
        // If the declaration list contains multiple variables, eg. let x = 0, y = 1, mutableZ = 3; then
        // we should only provide one fix for the list even if two variables are invalid.
        // NOTE: When we have a mix of allowed and disallowed variables in the same DeclarationList
        // there is no sure way to know if we should do a fix or not, eg. if ignore-prefix=mutable
        // and the list is "let x, mutableZ", then "x" is invalid but "mutableZ" is valid, should we change
        // "let" to "const" or not? For now we change to const if at least one variable is invalid.
        var addFix = true;
        for (var _i = 0, _a = declarationList.declarations; _i < _a.length; _i++) {
            var variableDeclarationNode = _a[_i];
            if (!Shared.shouldIgnorePrefix(variableDeclarationNode, ctx.options, ctx.sourceFile)) {
                invalidVariableDeclarationNodes.push(Shared.createInvalidNode(variableDeclarationNode, addFix
                    ? new Lint.Replacement(declarationList.getStart(ctx.sourceFile), "let".length, "const")
                    : undefined));
                addFix = false;
            }
        }
        return invalidVariableDeclarationNodes;
    }
    return [];
}
