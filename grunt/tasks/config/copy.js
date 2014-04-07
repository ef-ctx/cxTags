/*globals bowerRepoDirectory:true */
module.exports = {

    bower: {
        files: [{
            expand: true,
            flatten: true,
            src: ['build/*.js', 'build/*.css'],
            dest: '<%= bowerRepoDirectory %>',
            filter: 'isFile'
        }]
    },
   
    dist: {
        files: [{
            expand: true,
            flatten: true,
            src: ['build/*.js', 'build/*.css'],
            dest: 'dist/',
            filter: 'isFile'
        }]
    }

};
