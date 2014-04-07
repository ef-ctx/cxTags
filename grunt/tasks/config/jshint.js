module.exports = {

    files: ['Gruntfile.js',
        ['<%= files.js.src %>'],
        ['<%= files.spec.src %>']
    ],

    options: {
        jshintrc: '.jshintrc'
    }

};
