const HTMLWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const postcssCustomProperties = require('postcss-custom-properties');

module.exports = {
  entry: [
    'whatwg-fetch',
    `${__dirname}/src/index.js`,
    'webpack-hot-middleware/client'
  ],
  output: {
    filename: '[name].js',
    path: `${__dirname}/../../webui`,
    publicPath: '/custom/tme-demo-ui'
  },
  mode: 'development',
  plugins: [
    new HTMLWebpackPlugin({
      template: `${__dirname}/src/index.html`,
      filename: 'index.html',
      inject: 'body'
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom'
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [ '@babel/preset-env', {
                targets: {
                  chrome: '72',
                  firefox: '66',
                  edge: '18',
                  safari: '12',
                  ie: '11'
                },
                useBuiltIns: 'usage',
                corejs: {
                  version: 3
                }
              }],
              [ '@babel/preset-react', {} ]
            ],
            plugins: [
              [ '@babel/plugin-proposal-decorators', { 'legacy': true } ],
              [ '@babel/plugin-proposal-class-properties', { 'loose' : true } ],
              'react-hot-loader/babel'
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
          'css-loader',
          { loader: 'postcss-loader',
            options: {
              plugins: () => ([ postcssCustomProperties ])
            }
          }
        ]
      }, {
        test: /\.(svg|ttf|eot|png)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: '.'
          }
        }
      }
    ]
  },
};
