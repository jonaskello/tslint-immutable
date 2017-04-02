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
    // public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    //   const walker = new ReadonlyArrayWalker(sourceFile, this.getOptions());
    //   return this.applyWithWalker(walker);
    // }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithFunction(sourceFile, walk);
    };
    return Rule;
}(Lint.Rules.AbstractRule));
Rule.FAILURE_STRING = "Only ReadonlyArray allowed.";
exports.Rule = Rule;
/*
class ReadonlyArrayWalker extends Lint.RuleWalker {

  protected visitTypeReference(node: ts.TypeReferenceNode): void {
    super.visitTypeReference(node);
    if (node.typeName.getText() === "Array") {
      this.addFailure(this.createFailure(node.typeName.getStart(), node.typeName.getWidth(), Rule.FAILURE_STRING));
    }
  }

  protected visitArrayLiteralExpression(node: ts.ArrayLiteralExpression): void {
    super.visitArrayLiteralExpression(node);
    // If the array literal is used in a variable declaration, the variable
    // must have a type spcecified, otherwise it will implicitly be of mutable Array type
    if (node.parent && node.parent.kind === ts.SyntaxKind.VariableDeclaration) {
      const variableDeclarationNode = node.parent as ts.VariableDeclaration;
      if (!variableDeclarationNode.type) {
        this.addFailure(this.createFailure(variableDeclarationNode.name.getStart(), variableDeclarationNode.name.getWidth(), Rule.FAILURE_STRING));
      }
    }
  }

}
*/
function walk(ctx) {
    return ts.forEachChild(ctx.sourceFile, cb);
    function cb(node) {
        if (node.kind === ts.SyntaxKind.TypeReference && isInvalidArrayTypeReference(node)) {
            return ctx.addFailureAtNode(node, Rule.FAILURE_STRING);
        }
        if (node.kind === ts.SyntaxKind.ArrayLiteralExpression && isInvalidArrayLiteralExpression(node)) {
            //return ctx.addFailureAtNode(node, Rule.FAILURE_STRING);
            var variableDeclarationNode = node.parent;
            ctx.addFailureAt(variableDeclarationNode.name.getStart(), variableDeclarationNode.name.getWidth(), Rule.FAILURE_STRING);
        }
        return ts.forEachChild(node, cb);
    }
}
function isInvalidArrayTypeReference(node) {
    if (node.typeName.getText() === "Array") {
        return true;
    }
    return false;
}
function isInvalidArrayLiteralExpression(node) {
    // If the array literal is used in a variable declaration, the variable
    // must have a type spcecified, otherwise it will implicitly be of mutable Array type
    if (node.parent && node.parent.kind === ts.SyntaxKind.VariableDeclaration) {
        var variableDeclarationNode = node.parent;
        if (!variableDeclarationNode.type) {
            return true;
        }
    }
    return false;
}
