const path = require('path');

const ROOT_DIR    = __dirname;
const SRC_DIR     = path.join(ROOT_DIR, 'src');
const ASSETS_DIR  = path.join(SRC_DIR, 'assets');
const OUT_DIR     = path.join(ROOT_DIR, 'dist');

module.exports = {
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

  devtool: 'inline-source-map',

  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    'webextension-polyfill': 'browser',
  },
};
