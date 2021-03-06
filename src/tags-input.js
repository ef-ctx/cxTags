/*globals console: true*/
'use strict';

/**
 * @ngdoc directive
 * @name tagsInput.directive:tagsInput
 *
 * @description
 * ngTagsInput is an Angular directive that renders an input box with tag editing support.
 *
 * @param {string} ngModel Assignable angular expression to data-bind to.
 * @param {string=} customClass CSS class to style the control.
 * @param {number=} tabindex Tab order of the control.
 * @param {string=} [placeholder=Add a tag] Placeholder text for the control.
 * @param {number=} [minLength=3] Minimum length for a new tag.
 * @param {number=} maxLength Maximum length allowed for a new tag.
 * @param {number=} minTags Sets minTags validation error key if the number of tags added is less than minTags.
 * @param {number=} maxTags Sets maxTags validation error key if the number of tags added is greater than maxTags.
 * @param {string=} [removeTagSymbol=×] Symbol character for the remove tag button.
 * @param {boolean=} [addOnEnter=true] Flag indicating that a new tag will be added on pressing the ENTER key.
 * @param {boolean=} [addOnSpace=false] Flag indicating that a new tag will be added on pressing the SPACE key.
 * @param {boolean=} [addOnComma=true] Flag indicating that a new tag will be added on pressing the COMMA key.
 * @param {boolean=} [addOnBlur=true] Flag indicating that a new tag will be added when the input field loses focus.
 * @param {string=} [allowedTagsPattern=^[a-zA-Z0-9\s]+$*] Regular expression that determines whether a new tag is valid.
 * @param {boolean=} [enableEditingLastTag=false] Flag indicating that the last tag will be moved back into
 *                                                the new tag input box instead of being removed when the backspace key
 *                                                is pressed and the input box is empty.
 * @param {expression} onTagAdded Expression to evaluate upon adding a new tag. The new tag is available as $tag.
 * @param {expression} onTagRemoved Expression to evaluate upon removing an existing tag. The removed tag is available as $tag.
 */

cxTags.directive('tagsInput', [
    '$document',
    '$exceptionHandler',
    '$rootScope',
    '$timeout',
    'tagsInputConfig',
    'EVENT',
    'DEFAULT_VALUES',
    function($document, $exceptionHandler, $rootScope, $timeout, tagsInputConfig, EVENT, DEFAULT_VALUES) {

        /**
         * Creates a simple pubsub in order to add handlers from outer scope
         */
        function SimplePubSub(messagingNamespace) {
            var events = {};

            return {
                on: function(name, handler) {
                    if (!events[name]) {
                        events[name] = [];
                    }
                    events[name].push(handler);
                },
                trigger: function(name, args) {
                    if (name && name.length > 0) {
                        if (messagingNamespace && messagingNamespace.length > 0) {
                            $rootScope.$broadcast(messagingNamespace, args);
                        }

                        angular.forEach(events[name], function(handler) {
                            handler.call(null, args);
                        });
                    }
                }
            };
        }

        return {
            restrict: 'AE',
            require: 'ngModel',
            scope: {
                tags: '=ngModel',
                onTagAdded: '&',
                onTagRemoved: '&',
                messagingNamespace: '@',
                hideTags: '=',
                minLength: '@',
                minTags: '=',
                maxTags: '=',
                isDropdown: '=',
                placeholder: '@'
            },
            replace: false,
            transclude: true,
            templateUrl: 'cxTags/tags-input.html',
            controller: function($scope, $attrs, $element) {
                var shouldRemoveLastTag;

                // directive values have a higher priority that those setten on config
                tagsInputConfig.load('tagsInput', $scope, $attrs, {
                    customClass: [String],
                    tabindex: [Number],
                    removeTagSymbol: [String, String.fromCharCode(215)],
                    maxLength: [Number],
                    placeholder: [String, ($scope.placeholder) ? $scope.placeholder : DEFAULT_VALUES.placeholder],
                    addOnEnter: [Boolean, true],
                    addOnSpace: [Boolean, false],
                    addOnComma: [Boolean, true],
                    addOnBlur: [Boolean, true],
                    allowedTagsPattern: [RegExp, /^[\-\_\s\:\;\.\,\/a-zA-Z0-9]+$/],
                    enableEditingLastTag: [Boolean, false]
                });

                $scope.tagMinLength = $scope.tagMinLength || DEFAULT_VALUES.tagMinLength;
                $scope.isDropdown = $scope.isDropdown || DEFAULT_VALUES.isDropDown;
                $scope.newTag = '';

                //EVENT HANDLING 
                $scope.events = new SimplePubSub($scope.messagingNamespace);
                $scope.events.on(EVENT.tagAdded, $scope.onTagAdded);
                $scope.events.on(EVENT.tagRemoved, $scope.onTagRemoved);

                $scope.$watch('tags', function() {
                    $rootScope.$broadcast($scope.messagingNamespace, {
                        $tags: $scope.tags
                    });
                });
                // if messagingNamespace has a value it means that the component will send and recieve messages from the rootScope,
                // this happens when for instance a tagList component has being configured to show and trigger 'delete' tags from 
                // the tag list which is inside of a cxTag component with the same namespace.
                if ($scope.messagingNamespace) {
                    $rootScope.$on($scope.messagingNamespace + '.' + EVENT.removeTag, function(event, index) {
                        $scope.remove(index);
                    });
                    $rootScope.$on($scope.messagingNamespace + '.' + EVENT.getTags, function() {
                        $scope.events.trigger(EVENT.tagAdded, {
                            $tags: $scope.tags
                        });
                    });
                }

                /**
                 *  Adds a new tag after checking if it is valid or not
                 */
                $scope.tryAdd = function() {
                    var changed = false,
                        tag = $scope.newTag,
                        exists = ((tag) && (tag.label) && (angular.isString(tag.label))),
                        tooShort = (exists && tag.label.length < $scope.minLength),
                        tooMany = (exists && $scope.maxTags && ($scope.tags.length > $scope.maxTags - 1)),
                        //patternAllowed = (exists && $scope.options.allowedTagsPattern.test(tag.label)),
                        isValidTag = exists && !tooShort && !tooMany;// && patternAllowed;

                    if (angular.isArray($scope.tags) && isValidTag) {
                        if ($scope.isDropdown) {
                            $scope.tags[0] = tag;
                        } else if ($scope.tags.indexOf(tag) === -1) {
                            $scope.tags.push(tag);
                        }

                        $scope.events.trigger(EVENT.tagAdded, {
                            $tag: tag,
                            $tags: $scope.tags
                        });

                        $scope.newTag = null;
                        $scope.events.trigger(EVENT.inputChange, '');
                        changed = true;
                    } else {
                        $scope.newTag = '';
                    }

                    return changed;
                };

                /**
                 * Check if the tag can be removed from the list
                 */
                $scope.tryRemoveLast = function() {
                    var changed = false;


                    if ($scope.tags.length > 0) {
                        if ($scope.options.enableEditingLastTag) {
                            $scope.newTag = $scope.remove($scope.tags.length - 1);
                        } else {
                            if (shouldRemoveLastTag) {
                                $scope.remove($scope.tags.length - 1);

                                shouldRemoveLastTag = false;
                            } else {
                                shouldRemoveLastTag = true;
                            }
                        }
                        changed = true;
                    }
                    return changed;
                };

                /**
                 * Removes a tag from the list
                 */
                $scope.remove = function(index) {
                    var removedTag = $scope.tags.splice(index, 1)[0];
                    $scope.events.trigger(EVENT.tagRemoved, {
                        $tag: removedTag,
                        $tags: $scope.tags
                    });
                    return removedTag;
                };

                // Watches changes on new tag and sets shouldRemoveLastTag to false everytime newTag is setted or cleared
                $scope.$watch(function() {
                    return (($scope.newTag) && ($scope.newTag.label) && ($scope.newTag.label.length > 0));
                }, function() {
                    shouldRemoveLastTag = false;
                });

                /**
                 * Handles style changes on the last tag
                 */
                $scope.getCssClass = function(index) {
                    var isLastTag = index === $scope.tags.length - 1;
                    return shouldRemoveLastTag && isLastTag ? 'selected' : '';
                };

                /**
                 * Returns the value typed in the input value. It is called from the highlight directive
                 */
                this.getInputValue = function() {
                    return $scope.newTag;
                };

                /**
                 * Wire the autocomplete component to the cxTags providing an API to the autocomplete directive
                 */
                this.registerAutocomplete = function() {
                    var input = $element.find('input');
                    input.on('keydown', function(e) {
                        $scope.events.trigger(EVENT.inputKeyDown, e);
                    });

                    input.parent().on('click', function(e) {
                        $scope.events.trigger(EVENT.inputClick);
                    });

                    input.on('focus', function(e) {
                        $scope.events.trigger(EVENT.inputFocus);
                    });

                    $scope.newTagChange = function() {
                        $scope.events.trigger(EVENT.inputChange, $scope.newTag);
                    };

                    return {
                        tryAddTag: function(tag) {
                            $scope.newTag = tag;
                            return $scope.tryAdd();
                        },
                        focusInput: function() {
                            input[0].focus();
                        },
                        getTags: function() {
                            if (!$scope.tags) {
                                $scope.tags = [];
                            }
                            return $scope.tags;
                        },
                        on: function(name, handler) {
                            $scope.events.on(name, handler);
                            return this;
                        }
                    };
                };
            },
            link: function(scope, element, attrs, ngModelCtrl) {
                var hotkeys = [KEYS.enter, KEYS.comma, KEYS.space, KEYS.backspace];
                var input = element.find('input');

                input
                    .on('keydown', function(e) {
                        // This hack is needed because jqLite doesn't implement stopImmediatePropagation properly.
                        // I've sent a PR to Angular addressing this issue and hopefully it'll be fixed soon.
                        // https://github.com/angular/angular.js/pull/4833
                        if (e.isImmediatePropagationStopped && e.isImmediatePropagationStopped()) {
                            return;
                        }

                        var key = e.keyCode,
                            isModifier = e.shiftKey || e.altKey || e.ctrlKey || e.metaKey;

                        if (isModifier || hotkeys.indexOf(key) === -1) {
                            return;
                        }

                        if (key === KEYS.enter && scope.options.addOnEnter ||
                            key === KEYS.comma && scope.options.addOnComma ||
                            key === KEYS.space && scope.options.addOnSpace) {

                            if (scope.tryAdd()) {
                                scope.$apply();
                            }
                            e.preventDefault();
                        } else if (key === KEYS.backspace && this.value.length === 0) {
                            if (scope.tryRemoveLast()) {
                                scope.$apply();

                                e.preventDefault();
                            }
                        }
                    })
                    .on('focus', function() {
                        if (scope.hasFocus) {
                            return;
                        }
                        scope.hasFocus = true;
                        scope.$apply();
                    })
                    .on('blur', function() {
                        $timeout(function() {
                            var parentElement = angular.element($document[0].activeElement).parent();
                            if (parentElement[0] !== element[0]) {
                                scope.hasFocus = false;
                                if (scope.options.addOnBlur) {
                                    scope.tryAdd();
                                }
                                scope.events.trigger(EVENT.inputBlur);
                                scope.$apply();
                            }
                        }, 0, false);
                    });

                element.find('div').on('click', function() {
                    input[0].focus();
                });

                scope.$watch('tags.length', function() {
                    ngModelCtrl.$setValidity('maxTags', angular.isUndefined(scope.maxTags) || scope.tags.length <= scope.maxTags);
                    ngModelCtrl.$setValidity('minTags', angular.isUndefined(scope.minTags) || scope.tags.length >= scope.minTags);
                });
            }
        };
    }
]);
