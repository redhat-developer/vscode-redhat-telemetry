import * as path from 'path';
import * as webpack from 'webpack';
const WarningsToErrorsPlugin = require('warnings-to-errors-webpack-plugin');

// in case you run into any typescript error when configuring `devServer`
// import 'webpack-dev-server';
const nodeConfig: webpack.Configuration = {
  mode: 'production',
  entry: './test-webpack/node/index.ts',
  externals: {
    "vscode": "commonjs vscode",
  },
  target: "node", // vscode extensions run in a Node.js-context
  node: {
    __dirname: false, // leave the __dirname-behavior intact
  },
  output: {
    path: path.resolve(__dirname, 'dist/node'),
    filename: 'foo.node.bundle.js',
  },
  plugins: [
    new WarningsToErrorsPlugin(),
  ],
  stats: {
    errorDetails: true,
  }
};

/*
const webworkerConfig: webpack.Configuration = {
  mode: 'production', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
  entry: './test-webpack/webworker/index.ts',
  target: 'webworker', // extensions run in a webworker context
  output: {
    path: path.resolve(__dirname, 'dist/webworker'),
    filename: 'foo.webworker.bundle.js',
  },
  resolve: {
    //mainFields: ['module', 'main'],
    //extensions: ['.ts', '.js'], // support ts-files and js-files
    alias: {
      'node-fetch': 'whatwg-fetch',
      'object-hash': 'object-hash/dist/object_hash.js',
    },
    fallback: {
      path: require.resolve('path-browserify'),
      'node-fetch': require.resolve('whatwg-fetch'),
      util: require.resolve('util'),
    },
  },
  plugins: [
    new WarningsToErrorsPlugin(),
    new webpack.ProvidePlugin({
      process: path.resolve(path.join(__dirname, 'node_modules/process/browser.js')), // provide a shim for the global `process` variable
    }),
  ],
  externals: {
    vscode: 'commonjs vscode', // ignored because it doesn't exist
  },
};
*/

module.exports = [nodeConfig];
