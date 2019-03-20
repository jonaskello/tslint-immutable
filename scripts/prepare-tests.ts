/**
 * Warning: This script is only intended to be run in the CI testing environment.
 * This scripts renames and delete files.
 */

import * as compareVersions from "compare-versions";
import * as fs from "fs";
import * as glob from "glob";
import * as ts from "typescript";

// Object.entries polyfill - needed for testing on node 6.
if (!Object.entries) {
  // tslint:disable-next-line: no-require-imports no-var-requires
  require("object.entries").shim();
}

// Find all files that match the pattern "test/**/*.pre-*"
glob("test/**/*.pre-*", (err, matches) => {
  if (err) {
    throw err;
  }

  // Group all versions of the same file.
  const files = matches.reduce<{
    readonly [file: string]: { readonly [version: string]: string };
  }>((map, file) => {
    const prefix = ".pre-";
    const prefixIndex = file.lastIndexOf(prefix);
    const basename = file.substring(0, prefixIndex);
    const version = file.substring(prefixIndex + prefix.length);
    const versionGroup = map[basename] || {};

    return {
      ...map,
      [basename]: {
        ...versionGroup,
        [version]: file
      }
    };
  }, {});

  // For each group, find the file that is the newest and supported by the currently install version of typescript.
  const renameMappings = Object.entries(files).map(([file, versionGroup]) => [
    versionGroup[
      Object.keys(versionGroup).reduce(
        (a, b) =>
          compareVersions(ts.versionMajorMinor, b) < 0 &&
          compareVersions(a, b) <= 0
            ? b
            : a,
        "0"
      )
    ],
    file
  ]) as [string | undefined, string][];

  // Rename that file so it is used for the test.
  renameMappings.forEach(([from, to]) => {
    if (from) {
      fs.renameSync(from, to);
    }
  });
});
