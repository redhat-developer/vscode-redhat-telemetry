const path = require('node:path');
const WarningsToErrorsPlugin = require('warnings-to-errors-webpack-plugin');

const nodeConfig = {
  mode: 'production',
  entry: './test-webpack/node/index.ts',
  externals: {
    vscode: 'commonjs vscode',
  },
  target: 'node',
  node: {
    __dirname: false,
  },
  output: {
    path: path.resolve(__dirname, 'dist/node'),
    filename: 'foo.node.bundle.js',
  },
  plugins: [new WarningsToErrorsPlugin()],
  stats: {
    errorDetails: true,
  },
};

module.exports = [nodeConfig];
