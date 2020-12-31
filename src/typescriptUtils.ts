
import { existsSync, } from "fs";
import { dirname } from "path";
import ts, { SyntaxKind } from "typescript";

export const getTsconfigPath = (sourceFile: string) => {
  if (!existsSync(sourceFile)) {
    throw new Error(`Can't find input file ${sourceFile}. Working dir: ${process.cwd()}`);
  }

  return ts.findConfigFile(sourceFile, ts.sys.fileExists)!;
}

let program: ts.Program;

/**
 * Get const enums from the provided files.
 * @param files N.B. paths should be from root
 */
export const getConstEnumsFromTsConfig = (tsconfigPath: string) => {
  if (!existsSync(tsconfigPath)) {
    throw new Error(`Can't find tsconfig file ${tsconfigPath}. Working dir: ${process.cwd()}`);
  }

  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  const compilerOptions = ts.parseJsonConfigFileContent(configFile.config, ts.sys, dirname(tsconfigPath));

  program = ts.createProgram(compilerOptions.fileNames, compilerOptions.options, undefined, program);
  const ambientWorkspaceFiles = program.getSourceFiles()
    .filter(x => !x.fileName.includes("node_modules") && x.fileName.includes(".d.ts"))

  const constEnums: ts.EnumDeclaration[] = [];
  const visitNode = (node: ts.Node) => {
    if (node.kind === SyntaxKind.EnumDeclaration && node.modifiers?.some(m => m.kind === SyntaxKind.ConstKeyword)) {
      constEnums.push(node as ts.EnumDeclaration);
    }
  };

  for (const file of ambientWorkspaceFiles) {
    ts.forEachChild(file, visitNode);
  }

  return constEnums.map(x => x);
};

