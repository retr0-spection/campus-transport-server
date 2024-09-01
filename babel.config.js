const test = true;

module.exports = {
  plugins: [
    ...(test ? ['babel-plugin-transform-import-meta'] : [])
  ]
};