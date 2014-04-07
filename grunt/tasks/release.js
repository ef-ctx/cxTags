module.exports = function(grunt) {
    'use strict';

    grunt.registerTask('release', [
        'pack',
        'changelog',
        'replace:changelog',
//        'shell:git',
        'copy:dist'
    ]);
    
};
