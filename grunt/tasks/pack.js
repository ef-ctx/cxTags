module.exports = function(grunt) {
    'use strict';

    grunt.registerTask('pack', [
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


    grunt.registerTask('dev',[
        'test',
        'clean',
        'ngtemplates',
        'concat:dev',
        'uglify',
        'cssmin',
        'compress',
        'clean:tmp',
        'copy:dist'
    ]);

};
