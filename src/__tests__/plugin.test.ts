
import { transformFileAsync } from "@babel/core";
import { existsSync, readFileSync } from "fs";

const runPlugin = async (file: string) => {
  if (!existsSync(file)) {
    throw new Error(`Can't find input file ${file}. Working dir: ${process.cwd()}`);
  }

  const res = transformFileAsync(file, {
    babelrc: false,
    plugins: ["./src/plugin.ts"],
    presets: ["@babel/preset-typescript"],
  });

  if (!res) {
    throw new Error("plugin failed");
  }

  return res;
};

describe("plugin", () => {
  const sampleNames = [
    ["numericSwitch", "test.ts"],
    ["objectProperty", "test.ts"],
    ["stringTernary", "test.ts"],
  ];

  it.each(sampleNames)(
    "should transform %s sample as expected",
    async (sampleName, samplePath) => {
      const entrypoint = `./sample/${sampleName}/${samplePath}`;
      const transformed = await runPlugin(entrypoint);
      expect(transformed).toBeDefined();

      const expectedFilePath = `./sample/${sampleName}/output.js`;
      const expectedOutput = existsSync(expectedFilePath)
        ? readFileSync(expectedFilePath, "utf8")
        : "";
      expect(transformed!.code).toEqual(expectedOutput);
    });
});
