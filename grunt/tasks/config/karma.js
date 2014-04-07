module.exports = {

    options: {
        configFile: './grunt/karma.conf.js'
    },
    continuous: {
        singleRun: true,
        browsers: ['PhantomJS'],
        reporters: ['progress', 'coverage']
    }

};
