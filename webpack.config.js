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
    popup: path.join(SRC_DIR, 'popup/index.js'),
    app: path.join(SRC_DIR, 'app/index.js'),
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
      chunks: ['popup'],
      title: 'StoredSafe',
      favicon: path.join(ASSETS_DIR, 'favicon.ico'),
      filename: 'popup.html',
    }),
    new HtmlWebpackPlugin({
      template: path.join(SRC_DIR, 'index.html'),
      chunks: ['app'],
      title: 'StoredSafe',
      favicon: path.join(ASSETS_DIR, 'favicon.ico'),
      filename: 'app.html',
    }),
    new CopyPlugin([
      { from: './src/assets/' },
    ]),
  ],

  devtool: 'inline-source-map',
  devServer: {
    contentBase: OUT_DIR,
  },

  // externals: {
    // react: 'React',
    // 'react-dom': 'ReactDOM',
  // },
};
