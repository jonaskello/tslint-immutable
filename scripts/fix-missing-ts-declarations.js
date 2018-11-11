// @ts-check

const fs = require("fs");

const typescriptTypes = fs.readFileSync("node_modules/typescript/lib/typescript.d.ts", { encoding: 'utf-8' });
const missingTypesFix = fs.readFileSync("typings/typescript.fix.d.ts", { encoding: 'utf-8' });

const adjustedTypescriptTypes = typescriptTypes.replace(/declare (namespace|function) /g, '$1 ')

const fixedTypes = `declare module "typescript" {\n${adjustedTypescriptTypes}\n\nnamespace ts {\n${missingTypesFix}\n}\n}`;

fs.writeFileSync("typings/typescript.d.ts", fixedTypes, { encoding: 'utf-8' });
