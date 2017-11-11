module.exports = function(config) {
  config.set({
    frameworks: ['browserify', 'jasmine', 'source-map-support'],
    files: [
      './build/*.js',
    ],
    preprocessors: {
      './build/*.js': ['sourcemap', 'browserify'],
    },
    logLevel: config.LOG_INFO,
    browsers: ['Chrome'],
    browserify: {
      debug: true
    }
  })
}
