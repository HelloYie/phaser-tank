'use strict';

var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var StatsPlugin = require('stats-webpack-plugin');

module.exports = {
  entry: [
    path.join(__dirname, 'client/js/main.js')
  ],
  output: {
    path: path.join(__dirname, '/client/static/'),
    filename: '[name]-[hash].min.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new HtmlWebpackPlugin({
      template: 'client/index.tpl.html',
      inject: 'body',
      filename: 'index.html'
    }),
    new ExtractTextPlugin('[name]-[hash].min.css'),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false,
        screw_ie8: true
      }
    }),
    new StatsPlugin('webpack.stats.json', {
      source: false,
      modules: false
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          "presets": ["es2015", "stage-0"]
        }
      }, {
        test: /\.json?$/,
        loader: 'json'
      }, {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style', 'css?modules&localIdentName=[name]---[local]---[hash:base64:5]')
      }, {
        test: /\.(jpe?g|png|gif|bmp|ico)$/i,
        loader: 'file?name=img/[name].[ext]',
      }
    ]
  },
  resolve: {
    extensions: ['', '.js'],
    modulesDirectories: [
      'node_modules',
      path.join(__dirname, '/client/'),
      path.join(__dirname, '/utils/'),
    ],
  }
};
