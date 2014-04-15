'use strict';

/**
 * @ngdoc directive
 * @name tagsInput.directive:tiTranscludeAppend
 *
 * @description
 * Re-creates the old behavior of ng-transclude. Used internally by tagsInput directive.
 */
cxTags.directive('tiTranscludeAppend', function() {
    return function(scope, element, attrs, ctrl, transcludeFn) {
        transcludeFn(function(clone) {
            element.append(clone);
        });
    };
});
