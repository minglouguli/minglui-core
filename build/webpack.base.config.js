const path = require('path');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');

console.log('===:' + process.env.NODE_ENV);

module.exports = {
  mode: 'production', //development   production

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          process.env.NODE_ENV !== 'production'
            ? 'style-loader'
            : MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // 将 JS 字符串生成为 style 节点
          //'style-loader',
          process.env.NODE_ENV !== 'production'
            ? 'style-loader'
            : MiniCssExtractPlugin.loader,
          // 将 CSS 转化成 CommonJS 模块
          'css-loader',
          // 将 Sass 编译成 CSS
          {
            loader: 'sass-loader',
            options: {
              // Prefer `dart-sass`
              // implementation: require('sass'),
              // sass-loader version >= 8
              // sassOptions: {
              // }
            }
          }
        ]
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader'
        // use: {
        //   loader: 'babel-loader',
        //   options: {
        //     presets: [
        //       [
        //         '@babel/preset-env',
        //         {
        //           targets: {
        //             browsers: ['> 1%', 'last 2 versions', 'not dead']
        //           }
        //         }
        //       ]
        //     ]
        //   }
        // }
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    })
  ],
  optimization: {
    minimize: false
  }
};
