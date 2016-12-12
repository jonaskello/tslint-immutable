"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Lint = require("tslint");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        var walker = new PropertyInterfaceWalker(sourceFile, this.getOptions());
        return this.applyWithWalker(walker);
    };
    return Rule;
}(Lint.Rules.AbstractRule));
Rule.FAILURE_STRING = "Only the same kind of members allowed in interfaces.";
exports.Rule = Rule;
var PropertyInterfaceWalker = (function (_super) {
    __extends(PropertyInterfaceWalker, _super);
    function PropertyInterfaceWalker() {
        return _super.apply(this, arguments) || this;
    }
    PropertyInterfaceWalker.prototype.visitInterfaceDeclaration = function (node) {
        // Extract 'kind' from all members to a list of numbers.
        var memberKinds = node.members.map(function (m) { return m.kind; });
        // Check so all members of a node have the same kind,
        var unUniqueMember = uniqIndex(memberKinds);
        if (unUniqueMember !== -1) {
            this.addFailure(this.createFailure(node.members[unUniqueMember].getStart(), node.members[unUniqueMember].getWidth(), Rule.FAILURE_STRING));
        }
        _super.prototype.visitInterfaceDeclaration.call(this, node);
    };
    return PropertyInterfaceWalker;
}(Lint.RuleWalker));
/**
 * Return the index of the first non unique item.
 *
 */
function uniqIndex(list) {
    var i = 0;
    var lastItem = undefined;
    for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
        var item = list_1[_i];
        if (lastItem !== undefined && lastItem !== item) {
            return i;
        }
        i++;
        lastItem = item;
    }
    return -1;
}
