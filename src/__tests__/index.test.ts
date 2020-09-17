import "jest";

import { compile } from "../index";

describe("tests", () => {

  it("should fail if file doesn't exist", () => {
    expect(() => compile(["abc"])).toThrowError("Can't find input file abc");    
  })

  it("should work", () => {
    const result = compile(["./sample/types.d.ts"]);
    expect(result).toContain("TestEnum");
  })
})