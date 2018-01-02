module.exports = {
    module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true,
                    presets: [
                        ['env', {
                            'modules': false,
                            'targets': {
                                'browsers': ['> 2%'],
                                uglify: true
                            }
                        }]
                    ],
                    plugins: ['transform-object-rest-spread']
              }
            }
          },
          {
            test: /\.vue$/,
            use: 'vue-loader'
          }
        ]
      }
}
