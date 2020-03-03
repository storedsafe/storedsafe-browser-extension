const path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const ROOT_DIR    = __dirname;
const SRC_DIR     = path.join(ROOT_DIR, 'src');
const ASSETS_DIR  = path.join(SRC_DIR, 'assets');
const OUT_DIR     = path.join(ROOT_DIR, 'dist');

module.exports = {
  entry: {
    app: path.join(SRC_DIR, 'index.js'),
    background: path.join(SRC_DIR, 'background.js')
  },
  output: {
    path: OUT_DIR,
    filename: '[name].bundle.js'
  },

  module: {
    rules: [
      // BABEL
      {
        test: /\.js$/,
        include: [
          SRC_DIR,
        ],
        use: 'babel-loader',
      },
      // SASS
      {
        test: /\.s[ac]ss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      // IMAGES
      {
        test: /\.(png|svg|jpe?g|gif)$/,
        use: [
          'file-loader',
        ],
      },
    ],
  },

  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(SRC_DIR, 'index.html'),
      title: 'StoredSafe',
      favicon: path.join(ASSETS_DIR, 'favicon.ico'),
      meta: {
        charset: 'UTF-8',
        viewport: 'width=device-width, initial-scale=1',
        author: 'Oscar Mattsson',
        description: 'Provides cats as a browser extension using TheCatAPI',
      },
    }),
    new CopyPlugin([
      { from: './src/assets/' },
    ]),
  ],

  devtool: 'inline-source-map',
  devServer: {
    contentBase: OUT_DIR,
  },
};
