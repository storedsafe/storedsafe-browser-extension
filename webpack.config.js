const path = require('path');

const ROOT_DIR = __dirname;
const SRC_DIR = path.join(ROOT_DIR, 'src');

module.exports = {
  resolve: {
    extensions: ['.jsx', '.js', '.json'],
  },
  module: {
    rules: [
      // BABEL
      {
        test: /\.jsx?$/,
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

  devtool: 'inline-source-map',

  externals: { 'webextension-polyfill': 'browser' },
};
