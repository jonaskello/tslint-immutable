const shell = require('shelljs');

const cmdArguments = process.argv.slice(2);
const semverType = cmdArguments[0];

if(!semverType || !semverType.match(/^(major|minor|patch)$/)) {
    console.log(`Usage: major|minor|patch`);
    process.exit(1);
}

execCommand(`npm version ${semverType}`);
execCommand(`yarn run build`);
execCommand(`yarn run test:rules`);
execCommand(`git push`);
execCommand(`git push --tags`);
execCommand(`yarn publish`);

function execCommand(command) {
    const result = shell.exec(command);
    if(!!result.code) {
        console.log(result.stdout);
        process.exit(1);
    }
}
