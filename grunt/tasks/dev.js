module.exports = function(grunt) {
    'use strict';

    grunt.registerTask('dev',[
        'test',
        'clean',
        'ngtemplates',
        'concat',
        'uglify',
        'cssmin',
        'compress',
        'clean:tmp',
        'copy:dist'
    ]);

};
