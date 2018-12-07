module.exports = {
  devServer: {
    proxy: 'http://server:5000',
    port: '3000',
  },
  css: {
    modules: true,
  },
};
