/* eslint @typescript-eslint/no-var-requires: off */
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');

module.exports = {
  entry: {
    'main': SRC_DIR + '/index.tsx',
    'background': SRC_DIR + '/background.ts',
    'content_script': SRC_DIR + '/content_script.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },

  resolve: {
    extensions: [
      '.ts',
      '.tsx',
      '.js',
    ],
  },

  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          },
        ],
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader'
      },
      {
        test: /\.s[ac]ss$/,
        use: [ 'style-loader', 'css-loader', 'postcss-loader', 'sass-loader' ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        use: ['file-loader'],
      },
    ],
  },

  devtool: 'source-map',

  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
  },
};
