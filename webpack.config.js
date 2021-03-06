const path = require("path");
const webpack = require('webpack');
const DiezWebpackPlugin = require('diez-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const dotenv = require('dotenv').config({
  path: path.join(__dirname, '.env')
});


module.exports = {
  mode: 'production',
  target: 'web',
  devtool: 'source-map',
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.scss', '.js'],
  },
  plugins: [
    new DiezWebpackPlugin({
      sdk: 'diez-thisbounty-styles'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[hash].css',
      chunkFilename: '[id].[hash].css'
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),
    new CopyPlugin({
      patterns: [{ from: 'static', to: 'static' }, { from: './static/favicon/' }],
      options: {
        concurrency: 10,
      }
    }),
    new webpack.DefinePlugin({
      "process.env": dotenv.parsed
    }),
  ],
  watch: false,
  watchOptions: {
    ignored: /node_modules/
  },
  module: {
    noParse: /node_modules\/localforage\/dist\/localforage.js/,
    rules: [
      {
        test: /\.ts(x?)$/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
        exclude: [/.*@diez.*/]
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        exclude: [/.*@diez.*/],
        use: [
          {
            loader: 'file-loader',
            options: {}
          }
        ]
      },
      {
        test: /\.module\.s(a|c)ss$/,
        loader: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: false
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: false
            }
          }
        ]
      },
      {
        test: /\.s(a|c)ss$/,
        exclude: [/\.module.(s(a|c)ss)$/],
        loader: [
          MiniCssExtractPlugin.loader,
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: false
            }
          }
        ]
      }
    ]
  },
  // When importing a module whose path matches one of the following, just
  // assume a corresponding global variable exists and use that instead.
  // This is important because it allows us to avoid bundling all of our
  // dependencies, which allows browsers to cache those libraries between builds.
  externals: {
    "react": "React",
    "react-dom": "ReactDOM"
  }
}
