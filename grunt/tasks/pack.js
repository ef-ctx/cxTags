module.exports = function(grunt) {
    'use strict';

    grunt.registerTask('pack', [
        'test',
        'clean',
        'ngtemplates',
        'concat',
        'ngAnnotate',
        'uglify',
        'cssmin',
        'compress',
        'clean:tmp'
    ]);

};
