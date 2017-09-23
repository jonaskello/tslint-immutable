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
/**
 * This rule checks that the readonly keyword is used in all PropertySignature and
 * IndexerSignature nodes (which are the only places that the readonly keyword can exist).
 */
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithFunction(sourceFile, function (ctx) {
            return Shared.walk(ctx, checkNode, "A readonly modifier is required.");
        }, Shared.parseOptions(this.ruleArguments));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
function checkNode(node, ctx) {
    return checkPropertySignatureAndIndexSignature(node, ctx);
}
function checkPropertySignatureAndIndexSignature(node, ctx) {
    if (node.kind === ts.SyntaxKind.PropertySignature ||
        node.kind === ts.SyntaxKind.IndexSignature ||
        node.kind === ts.SyntaxKind.PropertyDeclaration) {
        if (!(node.modifiers &&
            node.modifiers.filter(function (m) { return m.kind === ts.SyntaxKind.ReadonlyKeyword; })
                .length > 0)) {
            // Check if ignore-prefix applies
            if (Shared.shouldIgnorePrefix(node, ctx.options, ctx.sourceFile)) {
                return [];
            }
            var length_1 = node.getWidth(ctx.sourceFile);
            // const fulltext = node.getText(ctx.sourceFile);
            var fulltext = node.getText(ctx.sourceFile);
            return [
                Shared.createInvalidNode(node, new Lint.Replacement(node.end - length_1, length_1, "readonly " + fulltext))
            ];
        }
    }
    return [];
}
