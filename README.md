
# @travellocal/babel-plugin-declare-const-enum

A plugin for Babel to replace uses of `const enum` types declared in ambient typing files.

When loaded, this plugin
- finds a `tsconfig.json` file for each `/.ts(x)?/` file encountered
- uses the TypeScript compiler to find ambient const enums
- replaces any usages of the const enum with the value defined (e.g. if `MyEnum.Foo == 1`, the generated code will replace `MyEnum.Foo` with `1`).

# Usage

First, `yarn add -D` or `npm install --save-dev` `@travellocal/babel-plugin-declare-const-enum`.

## With Storybook (v6+)

In `.storybook/main.js`,

```ts
module.exports = {
  // ...
  babel: async (options) => {
    // Add 
    options.plugins.unshift(require.resolve('@travellocal/babel-plugin-declare-const-enum'))
    return options;
  },
  // ...
};
```

## With NextJS

Just add it to your `.babelrc`

```babelrc
{
  "presets": [
    "next/babel"
  ],
  "plugins": [
    "@travellocal/babel-plugin-declare-const-enum"
  ]
}
```
