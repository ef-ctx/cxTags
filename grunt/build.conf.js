/*globals grunt:true, packageFile: true*/
module.exports = {

    // Sets all files used by the script
    files: {
        js: {
            src: [
                'src/keycodes.js',
                'src/init.js',
                'src/constants.js',
                'src/tags-input.js',
                'src/cxTagList.js',
                'src/auto-complete.js',
                'src/transclude-append.js',
                'src/autosize.js',
                'src/highlight.js',
                'src/configuration.js'
            ],
            out: 'build/<%= pkg.name %>.js',
            outMin: 'build/<%= pkg.name %>.min.js'
        },
        css: {
            src: ['css/tags-input.css', 'css/autocomplete.css'],
            out: 'build/<%= pkg.name %>.css',
            outMin: 'build/<%= pkg.name %>.min.css'
        },
        html: {
            src: ['templates/tags-input.html', 'templates/auto-complete.html', 'templates/tag-list.html'],
            out: 'tmp/templates.js'
        },
        zip: {
            unminified: 'build/<%= pkg.name %>.zip',
            minified: 'build/<%= pkg.name %>.min.zip'
        },
        spec: {
            src: 'test/*.spec.js'
        }
    }

};
