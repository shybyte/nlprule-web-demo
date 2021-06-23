const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require('path');

module.exports = {
  entry: "./src/bootstrap.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "./src/bootstrap.js",
  },
  module: {
    rules: [{
      test: /\.(j|t)sx?$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['solid', '@babel/typescript']
        }
      }
    }],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.ts', '.tsx'],
  },
  experiments: {
    asyncWebAssembly: true
  },
  mode: "development",
  plugins: [
    new CopyWebpackPlugin(['static/index.html', 'static/index.css'])
  ],
};
