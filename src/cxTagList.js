/*globals console:true*/
'use strict';

tagsInput.directive('tagsInputExternalOutput', [
    '$rootScope',
    '$timeout',
    'EVENT',
    function($rootScope, $timeout, EVENT) {
        
        var linkFn = function($scope, element, attrs) {
                var tagsChangedHandler = function (event, target) {
                    $scope.tags = target.$tags;
                };
                
                if ($scope.tagList) {
                    $scope.tags = $scope.tagList;
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
                tagList: '='
            },
            replace: true,
            templateUrl: 'ngTagsInput/tag-list.html',
            link: linkFn
        };
    }
]);
