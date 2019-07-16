const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

// setting for webpack
process.traceDeprecation = true;
process.noDeprecation = true;

module.exports = {
  entry: {
    admin: './src/admin.webpack.js',
    admin_vendors: './src/admin.vendors.webpack.js'
  },
  output: {
    path: path.resolve(__dirname, 'cordova/www'),
    filename: '[name].js'
  },
  devServer: {
    contentBase: 'src',
    port: 8321
  },
  module: {
    rules: [
      // {
      //   test: /\.js$/,
      //   enforce: 'pre',
      //   use: 'eslint-loader'
      // },
      { test: require.resolve('jquery'), loader: 'expose-loader?$!expose-loader?jQuery' },
      {
        test: /\.html$/,
        use: 'html-loader'
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader',
          publicPath: '/'
        })
      },
      {
        test: /\.scss$/,
        use: [{
          loader: 'style-loader' // creates style nodes from JS strings
        }, {
          loader: 'style-ext-html-webpack-plugin' // translates CSS into CommonJS
        }, {
          loader: 'sass-loader' // compiles Sass to CSS
        }]
      },
      {
        test: /\.json$/,
        use: 'json-loader'
      },
      { test: /\.(woff|woff2)$/, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff', name: 'static/font/[name].[ext]' } },
      { test: /\.ttf$/, loader: 'file-loader', options: { limit: 1024, name: 'static/font/[name].[ext]' } },
      { test: /\.eot$/, loader: 'file-loader', options: { limit: 1024, name: 'static/font/[name].[ext]' } },
      { test: /\.svg$/, loader: 'file-loader', options: { limit: 1024, name: 'static/svg/[name].[ext]' } },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      }
    ]
  },
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  },
  plugins: [
    new webpack.ProvidePlugin({
      '_': 'lodash',
      moment: 'moment',
      lang: 'static/SystemMessage-zh-TW.js'
    }),
    new ExtractTextPlugin({
      filename: 'static/css/[name].css',
      allChunks: true
    }),
    new HtmlWebpackPlugin({
      title: 'DialysisAdmin',
      chunks: ['admin_vendors', 'admin'],
      template: 'src/admin.ejs',
      filename: 'admin.html'
    })
  ]
};
