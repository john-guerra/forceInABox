// const definition = require("./package.json");
// const dependencies = Object.keys(definition.dependencies);

// export default {
//   input: "index.js",
//   external: dependencies,
//   output: {
//     extend: true,
//     file: `build/${definition.name}.js`,
//     format: "umd",
//     globals: dependencies.reduce((p, v) => (p[v] = "d3", p), {}),
//     name: "d3"
//   }
// };


import ascii from "rollup-plugin-ascii";
import node from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import {terser} from "rollup-plugin-terser";
import * as meta from "./package.json";

const copyright = `// ${meta.homepage} v${meta.version} Copyright ${(new Date).getFullYear()} ${meta.author.name}`;

export default [
  {
    input: "src/forceInABox.js",
    plugins: [
      node({
        jsxnext: true,
        main: true,
        browser: true
      }),
      ascii()
    ],
    external: [
      "d3"
    ],
    output: {
      extend: true,
      banner: copyright,
      file: "dist/forceInABox.js",
      format: "umd",
      indent: false,
      name: "forceInABox",
      globals: {
        d3:"d3",
        "d3-scale-chromatic":"d3ScaleChromatic"
      }
    }
  },
  {
    input: "src/forceInABox.js",
    plugins: [
      node({
        jsxnext: true
      }),
      ascii(),
      commonjs()
    ],
    external: [
      "d3"
    ],
    output: {
      extend: true,
      banner: copyright,
      file: meta.module,
      format: "esm",
      indent: false,
      name: "forceInABox",
      globals: {
        d3:"d3",
        "d3-scale-chromatic":"d3ScaleChromatic"
      }
    }
  },
  {
    input: "src/forceInABox",
    plugins: [
      node({
        jsxnext: true,
        main: true,
        browser: true
      }),
      ascii(),
      terser({output: {preamble: copyright}})
    ],
    external: ["d3",
      "d3-scale-chromatic"
    ],
    output: {
      extend: true,
      file: "dist/forceInABox.min.js",
      format: "umd",
      indent: false,
      name: "forceInABox",
      globals: {
        d3:"d3",
        "d3-scale-chromatic":"d3ScaleChromatic"
      }
    }
  }
];