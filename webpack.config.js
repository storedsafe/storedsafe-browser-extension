const path = require('path')
const ExtensionDistributionWebpackPlugin = require('./plugins/ExtensionDistributionWebpackPlugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const SRC_DIR = path.join(__dirname, 'src')

module.exports = (env, args) => ({
  entry: {
    main: path.join(SRC_DIR, '/index.tsx'),
    background: path.join(SRC_DIR, '/scripts/background.ts'),
    content_script: path.join(SRC_DIR, '/scripts/content_script.ts')
  },

  output: {
    path: path.resolve(__dirname, 'build/bundle'),
    filename: '[name].js'
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },

  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader'
      },
      {
        test: /\.s[ac]ss$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        use: ['file-loader']
      }
    ]
  },

  devtool: 'source-map',

  plugins: [
    !args.watch ? new CleanWebpackPlugin() : () => { console.log('skip clean') },
    new HtmlWebpackPlugin({
      chunks: ['main'],
      templateParameters: {
        externals:
          args.mode === 'production'
            ? [
                'react.production.min.js',
                'react-dom.production.min.js',
                'browser-polyfill.min.js'
              ]
            : [
                'react.development.js',
                'react-dom.development.js',
                'browser-polyfill.min.js'
              ]
      }
    }),
    new ExtensionDistributionWebpackPlugin({
      assetsPath: path.resolve(__dirname, 'src/public'),
      distPath: path.resolve(__dirname, 'build/dist'),
      manifestPath: path.resolve(__dirname, 'src/manifests'),
      targets: ['firefox', 'chrome'],
      externals:
        args.mode === 'production'
          ? [
              path.resolve(
                __dirname,
                'node_modules/react/umd/react.production.min.js'
              ),
              path.resolve(
                __dirname,
                'node_modules/react-dom/umd/react-dom.production.min.js'
              ),
              path.resolve(
                __dirname,
                'node_modules/webextension-polyfill/dist/browser-polyfill.min.js'
              ),
              path.resolve(
                __dirname,
                'node_modules/webextension-polyfill/dist/browser-polyfill.min.js.map'
              )
            ]
          : [
              path.resolve(
                __dirname,
                'node_modules/react/umd/react.development.js'
              ),
              path.resolve(
                __dirname,
                'node_modules/react-dom/umd/react-dom.development.js'
              ),
              path.resolve(
                __dirname,
                'node_modules/webextension-polyfill/dist/browser-polyfill.min.js'
              ),
              path.resolve(
                __dirname,
                'node_modules/webextension-polyfill/dist/browser-polyfill.min.js.map'
              )
            ]
    })
  ],

  externals: {
    // react: 'React',
    // 'react-dom': 'ReactDOM'
  }
})
