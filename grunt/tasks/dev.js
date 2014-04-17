module.exports = function(grunt) {
    'use strict';

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
