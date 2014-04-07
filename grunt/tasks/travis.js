module.exports = function(grunt) {
    'use strict';

    grunt.registerTask('travis', ['test', 'coveralls']);

};
