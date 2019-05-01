const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const postcssCustomProperties = require('postcss-custom-properties');

module.exports = {
  entry: [
    'whatwg-fetch',
    `${__dirname}/src/index.js`
  ],
  output: {
    filename: '[name].js',
    path: `${__dirname}/../../webui`,
  },
  mode: 'production',
  performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
  },
  optimization: {
    usedExports: true,
    splitChunks: {
      chunks: 'all'
    },
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: `${__dirname}/src/index.html`,
      filename: 'index.html',
      inject: 'body'
    }),
    new MiniCssExtractPlugin(),
  ],
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
              [ '@babel/plugin-proposal-class-properties', { 'loose' : true } ]
            ]
          }
        }
      }, {
        test: /\.css$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          'css-loader',
          { loader: 'postcss-loader',
            options: {
              plugins: () => ([ postcssCustomProperties ])
            }
          }
        ]
      }, {
        test: /\.(svg|ttf|eot)$/,
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
