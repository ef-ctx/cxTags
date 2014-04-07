module.exports = {

    ngTagsInput: {
        files: {
            '<%= files.html.out %>': ['<%= files.html.src %>']
        },
        options: {
            url: function(url) {
                'use strict';
                return 'ngTagsInput/' + url.replace('templates/', '');
            },
            bootstrap: function(module, script) {
                'use strict';
                return '/* HTML templates */\n' +
                    'tagsInput.run(function($templateCache) {\n' + script + '});\n';
            },
            htmlmin: {
                collapseWhitespace: true,
                removeRedundantAttributes: true
            }
        }
    }

};
