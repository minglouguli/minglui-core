const { merge } = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.config');
const path = require('path');

const webpackConfig = merge(baseWebpackConfig, {
  mode: 'production', //development   production
  entry: {
    index: './src/index.js',
    style: './src/index.scss'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../lib'),
    // libraryExport: 'default', // 对外暴露default属性，就可以直接调用default里的属性
    //libraryTarget: 'umd', // 定义打包方式
    // globalObject: 'this',
    publicPath: '/lib',
    //library: 'MlCore',
    umdNamedDefine: true,
    clean: true,
    library: {
      name: 'MlCore',
      type: 'umd'
    }
  }
});
module.exports = webpackConfig;
