/*globals console:true*/
'use strict';

cxTags.directive('cxTagList', [
    '$rootScope',
    '$timeout',
    'EVENT',
    function($rootScope, $timeout, EVENT) {
        
        var linkFn = function($scope, element, attrs) {
                var tagsChangedHandler = function (event, target) {
                    $scope.tagList = target.$tags;
                };
                
                if ($scope.tags) {
                    $scope.tagList = $scope.tags;
                }

                if ($scope.messagingNamespace && ($scope.messagingNamespace.length > 0)) {
                    $timeout(function () {
                            $rootScope.$broadcast($scope.messagingNamespace + '.' + EVENT.getTags);
                        }, 50);

                    $rootScope.$on($scope.messagingNamespace + '.' + EVENT.tagAdded, tagsChangedHandler );
                    $rootScope.$on($scope.messagingNamespace + '.' + EVENT.tagRemoved, tagsChangedHandler );
                }

                $scope.remove = function (index) {
                    $rootScope.$broadcast($scope.messagingNamespace + '.' + EVENT.removeTag, index);
                };
            };

        return {
            scope: {
                messagingNamespace: '@',
                removeEnabled: '=',
                tags: '='
            },
            replace: true,
            templateUrl: 'cxTags/tag-list.html',
            link: linkFn
        };
    }
]);
