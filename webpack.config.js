const path = require('path');

const ROOT_DIR = __dirname;
const SRC_DIR = path.join(ROOT_DIR, 'src');

const devBuild = process.env.NODE_ENV !== 'production';

module.exports = {
  mode: devBuild ? 'development' : 'production',
  resolve: {
    extensions: ['.jsx', '.js', '.json'],
  },
  entry: {
    extension: path.join(__dirname,
      'src/extension/index.jsx'),
    background: path.join(__dirname,
      'src/extension/scripts/background.js'),
    content_script: path.join(__dirname,
      'src/extension/scripts/content_script.js'),
  },
  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname, 'build/'),
  },
  module: {
    rules: [
      // BABEL
      {
        test: /\.jsx?$/,
        include: [
          SRC_DIR,
        ],
        use: ['babel-loader'],
      },
      // SASS
      {
        test: /\.s[ac]ss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      // IMAGES
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        use: ['file-loader'],
      },
    ],
  },

  devtool: 'inline-source-map',
  devServer: {
    lazy: true,
    filename: 'extension.bundle.js',
    contentBase: path.join(SRC_DIR, 'assets/'),
  },

  externals: { 'webextension-polyfill': 'browser' },
};
