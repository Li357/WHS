const path = require('path');

module.exports = {
  productionSourceMap: false,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
      },
    },
  },
  chainWebpack: (config) => {
    config
      .plugin('fork-ts-checker')
      .tap((args) => {
        args[0].tsconfig = path.resolve(__dirname, 'tsconfig.frontend.json');
        return args;
      });
  },
  configureWebpack: {
    devtool: 'source-map',
  },
};
