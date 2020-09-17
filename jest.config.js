
module.exports = {
  rootDir: "src",
  testRegex: ".*\\.(test|spec)\\.(t|j)s(x)?$",
  globals: {
    "globalConfig": {},
    "ts-jest": {
      tsConfig: "<rootDir>/../tsconfig.json"
    }
  },
  transform: {
    ".(ts|tsx)": "ts-jest"
  },
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "json"
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "package.json",
    "package-lock.json"
  ],
};
