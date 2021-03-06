module.exports = {

    js: {
        options: {
            banner: '<%= banners.unminified %>\n' +
                '(function() {\n\'use strict\';\n\n',
            footer: '\n}());',
            separator: '\n\n',
            process: function(src) {
                'use strict';
                // Remove all 'use strict'; from the code and
                // replaces all double blank lines with one
                return src.replace(/'use strict';\n+/g, '')
                    .replace(/\n\n\s*\n/g, '\n\n');
            }
        },
        files: {
            '<%= files.js.out %>': ['<%= files.js.src %>', '<%= files.html.out %>']
        }
    },

    css: {
        files: {
            '<%= files.css.out %>': ['<%= files.css.src %>']
        }
    },

    dev: {
        files:{
            '<%= files.css.out %>': ['<%= files.css.src %>', '<%= files.css.dev %>']
        }
    }

};
