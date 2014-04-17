module.exports = function(grunt) {
    'use strict';

    grunt.registerTask('build', [
        'test',
        'clean',
        'ngtemplates',
        'concat:js',
        'concat:css',
        'ngAnnotate',
        'uglify',
        'cssmin',
        'compress',
        'clean:tmp'
    ]);

};
