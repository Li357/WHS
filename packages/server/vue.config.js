const path = require('path');

module.exports = {
  chainWebpack: (config) => {
    config
      .plugin('fork-ts-checker')
      .tap((args) => {
        args[0].tsconfig = path.resolve(__dirname, 'tsconfig.frontend.json');
        return args;
      });
  },
};
