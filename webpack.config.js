/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const ExtensionDistributionWebpackPlugin = require('./ExtensionDistributionWebpackPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const SRC_DIR = path.join(__dirname, 'src');

module.exports = (env, args) => ({
  entry: {
    'main': SRC_DIR + '/index.tsx',
    'background': SRC_DIR + '/scripts/background.ts',
    'content_script': SRC_DIR + '/scripts/content_script.ts',
  },

  output: {
    path: path.resolve(__dirname, 'build'),
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

  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      chunks: ['main'],
      templateParameters: {
        externals: args.mode === 'production' ? [
          'react.production.min.js',
          'react-dom.production.min.js',
          'browser-polyfill.min.js',
        ] : [
          'react.development.js',
          'react-dom.development.js',
          'browser-polyfill.js',
        ],
      },
    }),
    new ExtensionDistributionWebpackPlugin({
      assetsPath: path.resolve(__dirname, 'assets'),
      distPath: path.resolve(__dirname, 'dist'),
      manifestPath: path.resolve(__dirname, 'manifests'),
      targets: ['firefox', 'chrome'],
      externals: args.mode === 'production' ? [
        path.resolve(__dirname, 'node_modules/react/umd/react.production.min.js'),
        path.resolve(__dirname, 'node_modules/react-dom/umd/react-dom.production.min.js'),
        path.resolve(__dirname, 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js'),
        path.resolve(__dirname, 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js.map'),
      ] : [
        path.resolve(__dirname, 'node_modules/react/umd/react.development.js'),
        path.resolve(__dirname, 'node_modules/react-dom/umd/react-dom.development.js'),
        path.resolve(__dirname, 'node_modules/webextension-polyfill/dist/browser-polyfill.js'),
        path.resolve(__dirname, 'node_modules/webextension-polyfill/dist/browser-polyfill.js.map'),
      ],
    }),
  ],

  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
  },
});
