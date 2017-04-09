import * as ts from "typescript";
import * as Lint from "tslint";

//tslint:disable no-any

type Options = {
  containmentPath: string,
  allowedExternalFileNames: string[],
  disallowedInternalFileNames: string[],
};

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = "import outside containment path";
  public static FAILURE_STRING2 = "import of disallowed file within containment path";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new ImportsContainmentWalker(sourceFile, this.getOptions()));
  }
}

// The walker takes care of all the work.
class ImportsContainmentWalker extends Lint.RuleWalker {

  public visitImportDeclaration(node: ts.ImportDeclaration): void {

    const myOptions = getMyOptions(this.getOptions());
    if (!myOptions) {
      return;
    }
    const { containmentPath, allowedExternalFileNames, disallowedInternalFileNames }: Options = myOptions;

    const sourceFileRelativePath = getSourceFilePathRelativeToContainmentPath(this.getSourceFile().path, containmentPath);
    // Check if the file resides under the containment path
    if (sourceFileRelativePath) {
      // Remove the file name to get the path
      const sourceDirRelativePath = sourceFileRelativePath.substring(0, sourceFileRelativePath.lastIndexOf("/"));
      // Check that it is a sub directory under the containment path
      if (sourceDirRelativePath.length > containmentPath.length) {

        // console.log("sourceFilePath", sourceFileRelativePath);
        // console.log("sourceDirPath", sourceDirPath);

        const importRelativePath = getImportRelativePath(node);
        if (importRelativePath) {
          // Get the file name being imported
          const importFileName = importRelativePath.substring(importRelativePath.lastIndexOf("/") + 1);
          // Get how many levels below the containment path the file resides
          const levelsBelowPath = getLevelsBelowPath(containmentPath, sourceDirRelativePath);
          // Get how many levels up the module reference reaches
          const highestParentLevel = getHighestParentLevel(importRelativePath);
          // Check if the module reference reaches outside the containment path
          if (highestParentLevel >= levelsBelowPath) {
            // Relative import paths are not allowed to reach up to the containment path
            //throw Error("sourceDirPath: " + sourceDirRelativePath + ", importRelativePath: "
            //+ importRelativePath + ", highestParentLevel: " + highestParentLevel + ", levelsBelowPath: " +
            //levelsBelowPath + ", sourceFileName" + sourceFileName);
            // create a failure at the current position
            if (allowedExternalFileNames.indexOf(importFileName) === -1) {
              this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
            }
          } else {
            // Relative import paths that are not reaching up to the containment path
            // are not allowed to import certain file names
            if (disallowedInternalFileNames.indexOf(importFileName) !== -1) {
              this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING2));
            }
          }
        }
      }
    }

    // call the base version of this visitor to actually parse this node
    super.visitImportDeclaration(node);
  }

}

function getSourceFilePathRelativeToContainmentPath(sourceFilePath: string, containmentPath: string): string | undefined {

  // In run-time, the source file path can be a full path from "C:\XXX\YYY\ZZZ"
  // So we just try to match a part of the path with the containment dir
  const indexOfContainmentPath = sourceFilePath.lastIndexOf(containmentPath);

  //throw Error("indexOfContainmentDir: " + indexOfContainmentDir + ", absoluteSourceDirPath: " + absoluteSourceDirPath);

  // Check if the file resides under the containment path
  if (indexOfContainmentPath !== -1) {
    const relativeSourceFilePath = sourceFilePath.substr(indexOfContainmentPath);
    return relativeSourceFilePath;
  }
  return undefined;

}

function getMyOptions(options: any): Options | undefined {

  const myOptions: Options = options[0]; // "src/app";
  if (!myOptions) {
    return undefined;
  }
  const { containmentPath, allowedExternalFileNames, disallowedInternalFileNames }: Options = myOptions;
  if (!containmentPath) {
    return undefined;
  }
  return {
    containmentPath,
    allowedExternalFileNames: allowedExternalFileNames || [],
    disallowedInternalFileNames: disallowedInternalFileNames || []
  };

}

function getImportRelativePath(node: ts.ImportDeclaration): string | undefined {

  if (node.moduleSpecifier && (node.moduleSpecifier as any).text) {
    const moduleSpecifierText: string = (node.moduleSpecifier as any).text;
    if (moduleSpecifierText && moduleSpecifierText.length > 0) {
      // Make sure it is a relative path module reference
      if (moduleSpecifierText.charAt(0) === ".") {
        return moduleSpecifierText;
      }
    }
  }
  return undefined;
}

// Calculate how many levels below [path] that [subPath] resides
function getLevelsBelowPath(path: string, subPath: string): number {

  const pathParts = path.split("/").length;
  const subPathParts = subPath.split("/").length;
  return subPathParts - pathParts;

}

// Check the highest parent level a relative path reaches
// For example:
// "../../../file" reaches 3 parent levels up as highest
// "../../../hello/world/../file" reaches 3 parent levels up as highest
// "./hello/../../../" reaches 2 parent levels up as highest
function getHighestParentLevel(relativePath: string): number {

  const parts = relativePath.split("/");
  let highestParentLevel = 0;
  let currentLevel = 0;
  for (const part of parts) {
    currentLevel = currentLevel + (part === ".." ? 1 : -1);
    highestParentLevel = Math.max(currentLevel, highestParentLevel);
  }
  return highestParentLevel;
}
