const path = require('path');

module.exports = {
  entry: '../main.js', // Replace with the actual path to your main.js
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
