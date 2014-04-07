/*globals packageFile:true, pkg: true, bowerFile: true */
module.exports = function(grunt) {
    'use strict';

    grunt.registerTask('update-bower-version', function() {
        var pkg = grunt.file.readJSON(packageFile),
            bower = grunt.file.readJSON(bowerFile);

        bower.version = pkg.version;
        grunt.file.write(bowerFile, JSON.stringify(bower, null, '  '));
    });

};
