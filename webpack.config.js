const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    bundle: ['./app/app.js']
  },
  output: {
    path: __dirname + '/public',
    filename: 'app.js'
  },
  module: {
    rules: [
      {
        test: /\.bpmn$/,
        use: 'raw-loader'
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'assets/**', to: 'vendor/bpmn-js', context: 'node_modules/bpmn-js/dist/' },
        { from: 'assets/**', to: 'vendor/icons', context: 'app/' },
        { from: '**/*.{html,css}', context: 'app/' }
      ]
    })
  ],
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    host: "0.0.0.0",
    port: 8082
}
};