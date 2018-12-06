const HTMLWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: [
    `${__dirname}/src/index.js`,
    'webpack-hot-middleware/client'
  ],
  output: {
    filename: '[name].js',
    path: `${__dirname}/dist`,
    publicPath: '/custom/l3vpnui'
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
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['react', 'env'],
            plugins: [
              'react-hot-loader/babel',
              'transform-class-properties',
              'transform-decorators-legacy',
              'transform-object-rest-spread',
              ['transform-runtime', {
                'polyfill': false,
                'regenerator': true
              }]
            ]
          }
        },
      }, {
        test: /\.js$/,
        use: [ 'source-map-loader' ],
        enforce: 'pre'
      }, {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      }, {
        test: /\.(svg|ttf)$/,
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
