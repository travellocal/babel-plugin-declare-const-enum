
import { existsSync } from "fs";
import TS, { ModifierFlags, SyntaxKind } from "typescript";

/**
 * 
 * @param files N.B. paths should be from root
 */
export const compile = (files: string[]) => {
  console.log(process.cwd());

  for (const file of files) {
    if (!existsSync(file)) {
      throw new Error(`Can't find input file ${file}`);
    }
  }

  const program = TS.createProgram(files, { noEmit: true});
  const ambientWorkspaceFiles = program.getSourceFiles()
    .filter(x => !x.fileName.includes("node_modules") && x.fileName.includes(".d.ts"))
  
  const constEnums: TS.EnumDeclaration[] = [];
  const visitNode = (node: TS.Node) => {
    if (node.kind === SyntaxKind.EnumDeclaration && node.modifiers?.some(m => m.kind === SyntaxKind.ConstKeyword)) {
      constEnums.push(node as TS.EnumDeclaration);
    }
  };
  
  for (const file of ambientWorkspaceFiles) {
    TS.forEachChild(file, visitNode);
  }

  return constEnums.map(x => x.name.escapedText);
};
