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
        return this.applyWithFunction(sourceFile, function (ctx) { return Shared.walk(ctx, checkNode, "Only ReadonlyArray allowed."); }, Shared.parseOptions(this.ruleArguments));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
function checkNode(node, ctx) {
    var explicitTypeFailures = checkArrayTypeOrReference(node, ctx);
    var implicitTypeFailures = checkVariableOrParameterImplicitType(node, ctx);
    return explicitTypeFailures.concat(implicitTypeFailures);
}
function checkArrayTypeOrReference(node, ctx) {
    // We need to check both shorthand syntax "number[]" and type reference "Array<number>"
    if (node.kind === ts.SyntaxKind.ArrayType
        || (node.kind === ts.SyntaxKind.TypeReference && node.typeName.getText(ctx.sourceFile) === "Array")) {
        if (node.parent && Shared.shouldIgnorePrefix(node.parent, ctx.options, ctx.sourceFile)) {
            return [];
        }
        var typeArgument = "T";
        if (node.kind === ts.SyntaxKind.ArrayType) {
            var typeNode = node;
            typeArgument = typeNode.elementType.getFullText(ctx.sourceFile).trim();
        }
        else if (node.kind === ts.SyntaxKind.TypeReference) {
            var typeNode = node;
            if (typeNode.typeArguments) {
                typeArgument = typeNode.typeArguments[0].getFullText(ctx.sourceFile).trim();
            }
        }
        var length_1 = node.getWidth(ctx.sourceFile);
        return [Shared.createInvalidNode(node, new Lint.Replacement(node.end - length_1, length_1, "ReadonlyArray<" + typeArgument + ">"))];
    }
    return [];
}
function checkVariableOrParameterImplicitType(node, ctx) {
    if (node.kind === ts.SyntaxKind.VariableDeclaration || node.kind === ts.SyntaxKind.Parameter
        || node.kind === ts.SyntaxKind.PropertyDeclaration) {
        // The initializer is used to set and implicit type
        var varOrParamNode = node;
        if (Shared.shouldIgnorePrefix(node, ctx.options, ctx.sourceFile)) {
            return [];
        }
        if (!varOrParamNode.type) {
            if (varOrParamNode.initializer && varOrParamNode.initializer.kind === ts.SyntaxKind.ArrayLiteralExpression) {
                var length_2 = varOrParamNode.name.getWidth(ctx.sourceFile);
                var nameText = varOrParamNode.name.getText(ctx.sourceFile);
                var typeArgument = "any";
                // Not sure it is a good idea to guess what the element types are...
                // const arrayLiteralNode = varOrParamNode.initializer as ts.ArrayLiteralExpression;
                // if (arrayLiteralNode.elements.length > 0) {
                //   const element = arrayLiteralNode.elements[0];
                //   if (element.kind === ts.SyntaxKind.NumericLiteral) {
                //     typeArgument = "number";
                //   } else if (element.kind === ts.SyntaxKind.StringLiteral) {
                //     typeArgument = "string";
                //   } else if (element.kind === ts.SyntaxKind.TrueKeyword || element.kind === ts.SyntaxKind.FalseKeyword) {
                //     typeArgument = "boolean";
                //   }
                // }
                return [Shared.createInvalidNode(varOrParamNode.name, new Lint.Replacement(varOrParamNode.name.end - length_2, length_2, nameText + ": ReadonlyArray<" + typeArgument + ">"))];
            }
        }
    }
    return [];
}
