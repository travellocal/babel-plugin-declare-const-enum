import * as BabelTypes from "@babel/types"
import { Visitor } from "@babel/traverse";
import { getTsconfigPath, getConstEnumsFromTsConfig } from "./typescriptUtils";
import ts, { SyntaxKind } from "typescript";
import process from "process";
import tmp, { file } from "tmp";
import path from "path";
import fs from "fs";

export interface Babel {
  types: typeof BabelTypes;
}

/**
 * A plugin that rewrites usages of declare const enums with their values.
 */
const declareConstEnumPlugin = ({ types }: Babel): { visitor: Visitor } => {
  const tmpDir = tmp.dirSync();
  const visitedRecord = path.resolve(tmpDir.name, "visited.txt");
  const enumRecord = path.resolve(tmpDir.name, "enums.txt");

  return {
    visitor: {

      Program: (filePath, state) => {
        const currentFile = (state as any).file.opts.filename as string;

        // We only care for TypeScript files
        if (!/.ts(x)?$/.test(currentFile)) {
          return;
        }

        const tsconfigPath = getTsconfigPath(currentFile);
        if (!fs.existsSync(visitedRecord) || !fs.readFileSync(visitedRecord, "utf8").includes(tsconfigPath)) {
          console.debug(`declare-const-enum: Loading types from ${tsconfigPath}`);

          const ambientConstEnums = new Map<string, ts.EnumDeclaration>();
          const allEnums = getConstEnumsFromTsConfig(tsconfigPath);
          for (const foundEnum of allEnums) {
            const key = foundEnum.name.escapedText.toString();
            if (!ambientConstEnums.has(key)) {
              ambientConstEnums.set(key, foundEnum);
            }
            else {
              const match = ambientConstEnums.get(key)!;
              if (match.members.length !== foundEnum.members.length) {
                throw new Error(`Found a second reference to ${key} which had different members to the first. This is not supported.`);
              }
            }

            for (const member of foundEnum.members) {
              if (!member.initializer) {
                throw new Error(`${foundEnum.name}.${member.name} doesn't have an initializer. This is not supported.`);
              }

              if (!ts.isLiteralExpression(member.initializer)
                || (member.initializer.kind !== SyntaxKind.NumericLiteral
                  && member.initializer.kind !== SyntaxKind.StringLiteral)) {
                throw new Error(`${foundEnum.name}.${member.name} is not a numeric or string literal. This is not supported.`);
              }

              const formattedVal = member.initializer.kind === SyntaxKind.StringLiteral
                ? `"${member.initializer.text}"`
                : member.initializer.text;

              const memberVal = `${foundEnum.name.escapedText}.${(member.name as any).escapedText}=${formattedVal}`;
              fs.appendFileSync(enumRecord, `${memberVal}\n`);
            }
          }

          console.log(fs.readFileSync(enumRecord, "utf8"));

          fs.appendFileSync(visitedRecord, `${tsconfigPath}\n`);
        }
      },
      File: (path) => {
        console.log(path.node.program.sourceFile);
      },
      MemberExpression: (path) => {
        const { object, property } = path.node;

        if (types.isIdentifier(object) && types.isIdentifier(property)) {
          const ambientConstEnums = fs.readFileSync(enumRecord, "utf8");
          const expression = `${object.name}.${property.name}`;
          const lineStartIndex = ambientConstEnums.indexOf(expression);
          if (lineStartIndex < 0) {
            // TODO is there a way to distinguish enum access from other member access at this point?
            // throw new Error(`Found ${object.name}.${property.name} but a const enum called ${object.name} wasn't found.`)
            return;
          }

          let lineEndIndex = lineStartIndex;
          let char: string;
          do {
            lineEndIndex += 1;
            char = ambientConstEnums[lineEndIndex];
          }
          while (char !== '\n')

          const line = ambientConstEnums.slice(lineStartIndex, lineEndIndex);
          console.log(line);

          let value = line.split("=")[1];
          if (value.startsWith("\"")) {
            const stringVal = value.slice(1, value.length - 1);
            path.replaceWith(types.stringLiteral(stringVal));
          }
          else {
            path.replaceWith(types.numericLiteral(parseInt(value)));
          }

          console.debug(`Replaced ${object.name}.${property.name} with ${value}`);
        }
      },
    }
  }
};

export default declareConstEnumPlugin;
