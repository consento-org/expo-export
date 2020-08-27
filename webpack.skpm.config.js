const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = function (config, isPluginCommand) {
  const isProduction = process.env.NODE_ENV === 'production'

  for (const rule of config.module.rules) {
    if (rule.use.loader === '@skpm/file-loader') {
      if (!rule.exclude) {
        rule.exclude = /node_modules|template\//
      }
    }
  }

  config.module.rules.push({
    test: /\.tsx?$/,
    exclude: /node_modules|template\//,
    loader: 'ts-loader'
  })

  if (!config.resolve) {
    config.resolve = {
      extensions: []
    }
  }

  config.resolve.extensions = [...config.resolve.extensions, '.ts', '.tsx']

  // transformations for production (publish)
  if (isProduction) {
    config.mode = 'production'
    config.plugins.push(
      new webpack.LoaderOptionsPlugin({
        minimize: true
      })
    )
    config.optimization = {
      minimizer: [
        new TerserPlugin({
          test: /\.j|ts($|\?)/i
        })
      ]
    }
  }
}
