const { merge } = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.config');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const webpackConfig = merge(baseWebpackConfig, {
  mode: 'development', //development   production
  // 开发时可以方便查看错误的地方
  devtool: 'inline-source-map',
  entry: {
    app: './test/main.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, '../dist'),
    clean: true
  },

  plugins: [
    //  new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'MlCore Test'
      // filename: 'index.html',
      // template: '',
      // hash: false,
      // publicPath: 'auto',
      // favicon: '' //图标地址
      //  minify:false,  //mode ==production 则true 否则不压缩；
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, './../dist')
    },
    compress: true,
    port: 9000,
    open: true,
    //  open: ['/my-page', '/another-page']
    proxy: {
      '/api': {
        target: 'http://localhost:5000'
        // pathRewrite: { '^/api': '' },
      }
    }
  }
});
module.exports = webpackConfig;
