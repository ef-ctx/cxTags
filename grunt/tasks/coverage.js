module.exports = function(grunt) {
    'use strict';

    grunt.registerTask('coverage', ['test', 'open:coverage']);
};
