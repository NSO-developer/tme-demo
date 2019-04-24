const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const exec = require('child_process').exec;

module.exports = {
  entry: `${__dirname}/src/index.js`,
  output: {
    filename: '[name].js',
    path: `${__dirname}/../../webui`,
  },
  mode: 'production',
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
            presets: ['react', 'env'],
            plugins: [
              'transform-class-properties',
              'transform-decorators-legacy',
              'transform-object-rest-spread',
              ['transform-runtime', {
                'polyfill': false,
                'regenerator': true
              }]
            ]
          }
        }
      }, {
        test: /\.css$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          'css-loader'
        ]
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
