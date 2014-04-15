module.exports = {

    cxTags: {
        files: {
            '<%= files.html.out %>': ['<%= files.html.src %>']
        },
        options: {
            url: function(url) {
                'use strict';
                return 'cxTags/' + url.replace('templates/', '');
            },
            bootstrap: function(module, script) {
                'use strict';
                return '/* HTML templates */\n' +
                    'cxTags.run(function($templateCache) {\n' + script + '});\n';
            },
            htmlmin: {
                collapseWhitespace: true,
                removeRedundantAttributes: true
            }
        }
    }

};
