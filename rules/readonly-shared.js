/**
 * This file has code that is shared for all the readonly rules.
 * It supports the options for ignore-local and ignore-prefix which all readonly rules have.
 * The rules ony need to provide a checker function.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var OPTION_IGNORE_LOCAL = "ignore-local";
var OPTION_IGNORE_PREFIX = "ignore-prefix";
function createInvalidNode(node, replacement) {
    return { node: node, replacement: replacement };
}
exports.createInvalidNode = createInvalidNode;
//tslint:disable-next-line
function parseOptions(options) {
    var ignoreLocal = options.indexOf(OPTION_IGNORE_LOCAL) !== -1;
    var ignorePrefix;
    for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
        var o = options_1[_i];
        //tslint:disable-next-line
        if (typeof o === "object" && o[OPTION_IGNORE_PREFIX] !== null) {
            //tslint:disable-line
            ignorePrefix = o[OPTION_IGNORE_PREFIX];
            break;
        }
    }
    return { ignoreLocal: ignoreLocal, ignorePrefix: ignorePrefix };
}
exports.parseOptions = parseOptions;
function walk(ctx, checkNode, failureString) {
    return ts.forEachChild(ctx.sourceFile, cb);
    function cb(node) {
        // Skip checking in functions if ignore-local is set
        if (ctx.options.ignoreLocal &&
            (node.kind === ts.SyntaxKind.FunctionDeclaration ||
                node.kind === ts.SyntaxKind.ArrowFunction ||
                node.kind === ts.SyntaxKind.FunctionExpression ||
                node.kind === ts.SyntaxKind.MethodDeclaration)) {
            // We still need to check the parameters and return type
            var functionNode = node; //tslint:disable-line
            var invalidNodes = checkIgnoreLocalFunctionNode(functionNode, ctx, checkNode);
            // invalidNodes.forEach((n) => reportInvalidNodes(n, ctx, failureString));
            reportInvalidNodes(invalidNodes, ctx, failureString);
            // Now skip this whole branch
            return;
        }
        // Check the node
        reportInvalidNodes(checkNode(node, ctx), ctx, failureString);
        // Use return becuase performance hints docs say it optimizes the function using tail-call recursion
        return ts.forEachChild(node, cb);
    }
}
exports.walk = walk;
function reportInvalidNodes(invalidNodes, ctx, failureString) {
    invalidNodes.forEach(function (invalidNode) {
        return ctx.addFailureAtNode(invalidNode.node, failureString, invalidNode.replacement);
    });
}
exports.reportInvalidNodes = reportInvalidNodes;
function checkIgnoreLocalFunctionNode(functionNode, ctx, checkNode) {
    var invalidNodes = [];
    // Check either the parameter's explicit type if it has one, or itself for implict type
    for (var _i = 0, _a = functionNode.parameters.map(function (p) { return (p.type ? p.type : p); }); _i < _a.length; _i++) {
        var n = _a[_i];
        var invalidCheckNodes = checkNode(n, ctx);
        if (invalidCheckNodes) {
            invalidNodes = invalidNodes.concat.apply(invalidNodes, invalidCheckNodes);
        }
    }
    // Check the return type
    if (functionNode.type) {
        var invalidCheckNodes = checkNode(functionNode.type, ctx);
        if (invalidCheckNodes) {
            invalidNodes = invalidNodes.concat.apply(invalidNodes, invalidCheckNodes);
        }
    }
    return invalidNodes;
}
exports.checkIgnoreLocalFunctionNode = checkIgnoreLocalFunctionNode;
function shouldIgnorePrefix(node, options, sourceFile) {
    // Check ignore-prefix for VariableDeclaration, PropertySignature, TypeAliasDeclaration, Parameter
    if (options.ignorePrefix) {
        if (node &&
            (node.kind === ts.SyntaxKind.VariableDeclaration ||
                node.kind === ts.SyntaxKind.Parameter ||
                node.kind === ts.SyntaxKind.PropertySignature ||
                node.kind === ts.SyntaxKind.PropertyDeclaration ||
                node.kind === ts.SyntaxKind.TypeAliasDeclaration)) {
            var variableDeclarationNode = node;
            if (variableDeclarationNode.name
                .getText(sourceFile)
                .substr(0, options.ignorePrefix.length) === options.ignorePrefix) {
                return true;
            }
        }
    }
    return false;
}
exports.shouldIgnorePrefix = shouldIgnorePrefix;
