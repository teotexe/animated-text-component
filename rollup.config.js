import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import postcss from "rollup-plugin-postcss";
import postcssImport from "postcss-import";
import postcssPresetEnv from "postcss-preset-env";
import babel from "@rollup/plugin-babel";

const extensions = [".ts", ".tsx", ".js", ".jsx"];

export default {
  input: "src/index.ts",
  output: {
    dir: "dist",
    format: "esm",
    sourcemap: true,
    preserveModules: true,
    preserveModulesRoot: "src",
  },
  external: [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
  "opentype.js",
],
  plugins: [
    resolve({ extensions }),
    commonjs(),
    babel({
      extensions,
      babelHelpers: "bundled",
      include: ["src/**/*"],
      exclude: "node_modules/**",
    }),
    postcss({
      plugins: [postcssImport(), postcssPresetEnv()],
      modules: {
        generateScopedName: "[folder]_[local]-[hash:base64:5]",
      },
      namedExports: true,
      extract: true,
      sourceMap: true,
    }),
  ],
};
