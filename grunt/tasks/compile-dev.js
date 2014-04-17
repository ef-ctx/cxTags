module.exports = function(grunt) {
    'use strict';

    grunt.registerTask('compile-dev', [
        'build',
        'changelog',
        'replace:changelog',
        'copy:dist'
    ]);
    
};
