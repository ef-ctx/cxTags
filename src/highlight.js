/*globals console: true*/
'use strict';
/*
 * @ngdoc service
 * @name tagsInput.service:highlight
 *
 * @description
 * Provides highlight for matched text inside tag attributes
 * */
cxTags.directive('ngTagHighlight', [
    function() {

        return {

            require: '^tagsInput',

            scope: {
                ngTagHighlight: '@',
                tagAttribute: '@'
            },

            link: function (scope, element, attrs, tagInputCtrl) {
                var value = scope.ngTagHighlight,
                    inputText = tagInputCtrl.getInputValue(),
                    re = new RegExp('(' + inputText + ')', 'gi');

                element.html(value.replace(re, '<span class="highlighted">$1</span>'));
            }

        };
    }
]);
