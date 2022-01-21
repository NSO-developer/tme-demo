const HTMLWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = {
  entry: [
    'whatwg-fetch',
    `${__dirname}/src/index.js`,
    'webpack-hot-middleware/client'
  ],
  output: {
    filename: '[name].js',
    path: `${__dirname}/../../webui`,
    assetModuleFilename: '[name][ext]',
    publicPath: '/custom/tme-demo-ui'
  },
  mode: 'development',
  plugins: [
    new HTMLWebpackPlugin({
      template: `${__dirname}/src/index.html`,
      filename: 'index.html',
      inject: 'body'
    }),
    new webpack.HotModuleReplacementPlugin(),
    new ReactRefreshWebpackPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              'react-refresh/babel'
            ]
          }
        },
      }, {
        test: /\.js$/,
        use: [ 'source-map-loader' ],
        enforce: 'pre'
      }, {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }, {
        test: /\.(svg|ttf|eot|png)$/,
        type: 'asset/resource'
      }
    ]
  },
};
