import * as path from "path";
import * as webpack from "webpack";
const WarningsToErrorsPlugin = require("warnings-to-errors-webpack-plugin");

// in case you run into any typescript error when configuring `devServer`
// import 'webpack-dev-server';

const config: webpack.Configuration = {
  mode: "production",
  entry: "./test/index.ts",
  externals: {
    vscode: "commonjs vscode",
  },
  target: "node", // vscode extensions run in a Node.js-context
  node: {
    __dirname: false, // leave the __dirname-behavior intact
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "foo.bundle.js",
  },
  plugins: [new WarningsToErrorsPlugin()],
  stats: {
    errorDetails: true,
  },
};

export default config;
