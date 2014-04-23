module.exports = function(grunt) {
    'use strict';

    grunt.registerTask('dev',[
        'test',
        'clean',
        'ngtemplates',
        'concat',
        'cssmin',
        'clean:tmp',
        'copy:dist'
    ]);

};
