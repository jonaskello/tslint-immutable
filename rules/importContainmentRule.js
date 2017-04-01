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
var Lint = require("tslint");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new ImportsContainmentWalker(sourceFile, this.getOptions()));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
Rule.FAILURE_STRING = "import outside containment path";
Rule.FAILURE_STRING2 = "import of disallowed file within containment path";
exports.Rule = Rule;
// The walker takes care of all the work.
var ImportsContainmentWalker = (function (_super) {
    __extends(ImportsContainmentWalker, _super);
    function ImportsContainmentWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ImportsContainmentWalker.prototype.visitImportDeclaration = function (node) {
        var myOptions = getMyOptions(this.getOptions());
        if (!myOptions)
            return;
        var containmentPath = myOptions.containmentPath, allowedExternalFileNames = myOptions.allowedExternalFileNames, disallowedInternalFileNames = myOptions.disallowedInternalFileNames;
        var sourceFileRelativePath = getSourceFilePathRelativeToContainmentPath(this.getSourceFile().path, containmentPath);
        // Check if the file resides under the containment path
        if (sourceFileRelativePath) {
            // Remove the file name to get the path
            var sourceDirRelativePath = sourceFileRelativePath.substring(0, sourceFileRelativePath.lastIndexOf('/'));
            // Check that it is a sub directory under the containment path
            if (sourceDirRelativePath.length > containmentPath.length) {
                // console.log("sourceFilePath", sourceFileRelativePath);
                // console.log("sourceDirPath", sourceDirPath);
                var importRelativePath = getImportRelativePath(node);
                if (importRelativePath) {
                    // Get the file name being imported
                    var importFileName = importRelativePath.substring(importRelativePath.lastIndexOf('/') + 1);
                    // Get how many levels below the containment path the file resides
                    var levelsBelowPath = getLevelsBelowPath(containmentPath, sourceDirRelativePath);
                    // Get how many levels up the module reference reaches
                    var highestParentLevel = getHighestParentLevel(importRelativePath);
                    // Check if the module reference reaches outside the containment path
                    if (highestParentLevel >= levelsBelowPath) {
                        // Relative import paths are not allowed to reach up to the containment path
                        //throw Error("sourceDirPath: " + sourceDirRelativePath + ", importRelativePath: " + importRelativePath + ", highestParentLevel: " + highestParentLevel + ", levelsBelowPath: " + levelsBelowPath + ", sourceFileName" + sourceFileName);
                        // create a failure at the current position
                        if (allowedExternalFileNames.indexOf(importFileName) === -1)
                            this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
                    }
                    else {
                        // Relative import paths that are not reaching up to the containment path
                        // are not allowed to import certain file names
                        if (disallowedInternalFileNames.indexOf(importFileName) !== -1)
                            this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING2));
                    }
                }
            }
        }
        // call the base version of this visitor to actually parse this node
        _super.prototype.visitImportDeclaration.call(this, node);
    };
    return ImportsContainmentWalker;
}(Lint.RuleWalker));
function getSourceFilePathRelativeToContainmentPath(sourceFilePath, containmentPath) {
    // In run-time, the source file path can be a full path from "C:\XXX\YYY\ZZZ"
    // So we just try to match a part of the path with the containment dir
    var indexOfContainmentPath = sourceFilePath.lastIndexOf(containmentPath);
    //throw Error("indexOfContainmentDir: " + indexOfContainmentDir + ", absoluteSourceDirPath: " + absoluteSourceDirPath);
    // Check if the file resides under the containment path
    if (indexOfContainmentPath !== -1) {
        var relativeSourceFilePath = sourceFilePath.substr(indexOfContainmentPath);
        return relativeSourceFilePath;
    }
    return null;
}
function getMyOptions(options) {
    var myOptions = options[0]; // "src/app";
    if (!myOptions)
        return null;
    var containmentPath = myOptions.containmentPath, allowedExternalFileNames = myOptions.allowedExternalFileNames, disallowedInternalFileNames = myOptions.disallowedInternalFileNames;
    if (!containmentPath)
        return null;
    return {
        containmentPath: containmentPath,
        allowedExternalFileNames: allowedExternalFileNames || [],
        disallowedInternalFileNames: disallowedInternalFileNames || []
    };
}
function getImportRelativePath(node) {
    if (node.moduleSpecifier && node.moduleSpecifier.text) {
        var moduleSpecifierText = node.moduleSpecifier.text;
        if (moduleSpecifierText && moduleSpecifierText.length > 0) {
            // Make sure it is a relative path module reference
            if (moduleSpecifierText.charAt(0) === ".") {
                return moduleSpecifierText;
            }
        }
    }
    return null;
}
// Calculate how many levels below [path] that [subPath] resides
function getLevelsBelowPath(path, subPath) {
    var pathParts = path.split("/").length;
    var subPathParts = subPath.split("/").length;
    return subPathParts - pathParts;
}
// Check the highest parent level a relative path reaches
// For example:
// "../../../file" reaches 3 parent levels up as highest
// "../../../hello/world/../file" reaches 3 parent levels up as highest
// "./hello/../../../" reaches 2 parent levels up as highest
function getHighestParentLevel(relativePath) {
    var parts = relativePath.split("/");
    var highestParentLevel = 0;
    var currentLevel = 0;
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        currentLevel = currentLevel + (part === ".." ? 1 : -1);
        highestParentLevel = Math.max(currentLevel, highestParentLevel);
    }
    return highestParentLevel;
}
