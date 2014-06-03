/*!
 * cxTags v1.1.1
 * http://mbenford.github.io/ngTagsInput
 *
 * Copyright (c) 2013-2014 Michael Benford
 * License: MIT
 *
 * Generated at 2014-06-03 15:50:51 +0100
 */
(function() {
'use strict';

var KEYS = {
    backspace: 8,
    tab: 9,
    enter: 13,
    escape: 27,
    space: 32,
    up: 38,
    down: 40,
    comma: 188
};


var cxTags= angular.module('cxTags', []);


cxTags.constant('EVENT', {
    getTags: 'get-tags',
    tagAdded: 'tag-added',
    tagRemoved: 'tag-removed',      // this event is dispatched when the tag is removed from the array of tags
    removeTag: 'remove-tag',        // this event is dispatched from an external taglist 
    inputChange: 'input-change',
    inputKeyDown: 'input-keydown',
    inputBlur: 'input-blur',
    inputFocus: 'input-focus',
    inputClick: 'input-click'
});


/*globals console: true*/
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
    '$rootScope',
    '$timeout',
    'tagsInputConfig',
    'EVENT',

    function($document, $rootScope, $timeout, tagsInputConfig, EVENT) {

        /************************************************************************************************************************
         * 
         * Creates a simple pubsub in order to add handlers from outer scope 
         *
         ***********************************************************************************************************************/
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
                hideTags: '='
            },
            replace: false,
            transclude: true,
            templateUrl: 'cxTags/tags-input.html',
            controller: ["$scope","$attrs","$element", function($scope, $attrs, $element) {
                var shouldRemoveLastTag;

                tagsInputConfig.load('tagsInput', $scope, $attrs, {
                    customClass: [String],
                    placeholder: [String, 'Add a tag'],
                    tabindex: [Number],
                    removeTagSymbol: [String, String.fromCharCode(215)],
                    minLength: [Number, 3],
                    maxLength: [Number],
                    addOnEnter: [Boolean, true],
                    addOnSpace: [Boolean, false],
                    addOnComma: [Boolean, true],
                    addOnBlur: [Boolean, true],
                    allowedTagsPattern: [RegExp, /^[\-\_\sa-zA-Z0-9]+$/],
                    enableEditingLastTag: [Boolean, false],
                    minTags: [Number],
                    maxTags: [Number]
                });

                $scope.newTag = '';
                $scope.tags = $scope.tags || [];
                
                //*** EVENT HANDLING *****************************************************************************************************
                $scope.events = new SimplePubSub($scope.messagingNamespace);
                $scope.events.on(EVENT.tagAdded, $scope.onTagAdded);
                $scope.events.on(EVENT.tagRemoved, $scope.onTagRemoved);
                
                $scope.$watch('tags', function () {
                    $rootScope.$broadcast($scope.messagingNamespace, {$tags:$scope.tags});
                });
                // if messagingNamespace has a value it means that the component will send and recieve messages from the rootScope,
                // this happens when for instance a tagList component has being configured to show and trigger 'delete' tags from 
                // the tag list which is inside of a cxTag component with the same namespace.
                if ($scope.messagingNamespace) {
                    $rootScope.$on($scope.messagingNamespace + '.' + EVENT.removeTag, function (event, index){
                        $scope.remove(index);
                    });

                    $rootScope.$on($scope.messagingNamespace + '.' + EVENT.getTags, function (){
                        $scope.events.trigger(EVENT.tagAdded, {$tags:$scope.tags});
                    });
                }

                /*** tryAdd *************************************************************************************************************
                 *
                 *  Adds a new tag after checking if it is valid or not 
                 *
                 ***********************************************************************************************************************/
                $scope.tryAdd = function() {
                    var changed = false,
                        tag = $scope.newTag,
                        isValidTag = (tag) && (tag.label) && (angular.isString(tag.label)) && (tag.label.length >= $scope.options.minLength) && ($scope.options.allowedTagsPattern.test(tag.label));

                    if (isValidTag) {
                        if ($scope.tags.indexOf(tag) === -1) {
                            $scope.tags.push(tag);
                            $scope.events.trigger(EVENT.tagAdded, {$tag: tag, $tags: $scope.tags});
                        }

                        $scope.newTag = null;
                        $scope.events.trigger(EVENT.inputChange, '');
                        changed = true;
                    }

                    return changed;
                };

                /*** tryRemoveLast ******************************************************************************************************
                 * 
                 * Check if the tag can be removed from the list
                 *
                 ***********************************************************************************************************************/
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

                /*** remove *************************************************************************************************************
                 * Removes a tag from the list
                 ***********************************************************************************************************************/
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

                /*** getCssClass ********************************************************************************************************
                 * 
                 * Handles style changes on the last tag
                 *
                 ***********************************************************************************************************************/
                $scope.getCssClass = function(index) {
                    var isLastTag = index === $scope.tags.length - 1;
                    return shouldRemoveLastTag && isLastTag ? 'selected' : '';
                };
                
                /*** getInputValue ******************************************************************************************************
                 * 
                 * Returns the value typed in the input value. It is called from the highlight directive
                 *
                 ***********************************************************************************************************************/
                this.getInputValue = function () {
                    return $scope.newTag;
                };

                /*** registerAutocomplete ***********************************************************************************************
                 *
                 * Wire the autocomplete component to the cxTags providing an API to the autocomplete directive
                 *
                 ***********************************************************************************************************************/
                this.registerAutocomplete = function() {
                    var input = $element.find('input');
                    input.on('keydown', function(e) {
                        $scope.events.trigger(EVENT.inputKeyDown, e);
                    });

                    input.parent().on('click', function(e){
                        $scope.events.trigger(EVENT.inputClick);
                    });
                    
                    input.on('focus', function(e){
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
                            if (!$scope.tags){
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
            }],
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
                    ngModelCtrl.$setValidity('maxTags', angular.isUndefined(scope.options.maxTags) || scope.tags.length <= scope.options.maxTags);
                    ngModelCtrl.$setValidity('minTags', angular.isUndefined(scope.options.minTags) || scope.tags.length >= scope.options.minTags);
                });
            }
        };
    }
]);


/*globals console:true*/
cxTags.directive('cxTagList', [
    '$rootScope',
    '$timeout',
    'EVENT',
    function($rootScope, $timeout, EVENT) {
        
        var linkFn = function($scope, element, attrs) {
                var tagsChangedHandler = function (event, target) {
                    if (target && target.hasOwnProperty('$tags')){
                        $scope.tagList = target.$tags;
                    }
                };
                
                if ($scope.tags) {
                    $scope.tagList = $scope.tags;
                }

                if ($scope.messagingNamespace && ($scope.messagingNamespace.length > 0)) {
                    $timeout(function () {
                            $rootScope.$broadcast($scope.messagingNamespace + '.' + EVENT.getTags);
                        }, 50);

                    $rootScope.$on($scope.messagingNamespace, tagsChangedHandler );
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


/**
 * @ngdoc directive
 * @name tagsInput.directive:autoComplete
 *
 * @description
 * Provides autocomplete support for the tagsInput directive.
 *
 * @param {expression} source Expression to evaluate upon changing the input content. The input value is available as
 *                            $query. The result of the expression must be a promise that eventually resolves to an
 *                            array of strings.
 * @param {number=} [debounceDelay=100] Amount of time, in milliseconds, to wait before evaluating the expression in
 *                                      the source option after the last keystroke.
 * @param {number=} [minLength=3] Minimum number of characters that must be entered before evaluating the expression
 *                                 in the source option.
 * @param {boolean=} [highlightMatchedText=true] Flag indicating that the matched text will be highlighted in the
 *                                               suggestions list.
 * @param {number=} [maxResultsToShow=10] Maximum number of results to be displayed at a time.
 */

cxTags.directive('autoComplete', [
    '$document',
    '$timeout',
    '$sce',
    '$location',
    '$anchorScroll',
    'tagsInputConfig',
    'EVENT',
    function($document, $timeout, $sce, $location, $anchorScroll, tagsInputConfig, EVENT) {

        function SuggestionList(loadFn, families, options) {
            var self = {}, debouncedLoadId, getDifference, lastPromise;

            getDifference = function(array1, array2) {
                var result = [],
                    b = array2.map(function(a) {
                        return a.label;
                    });

                array1.forEach(function(item) {
                    if (b.indexOf(item.label) === -1) {
                        result.push(item);
                    }
                });

                return result;
            };

            self.reset = function() {
                lastPromise = null;

                self.items = [];
                self.visible = false;
                self.index = -1;
                self.selected = null;
                self.query = null;

                $timeout.cancel(debouncedLoadId);
            };

            self.show = function() {
                self.selected = null;
                self.visible = true;
            };

            self.load = function(query, tags, skipLengthChecking) {

                if ((!skipLengthChecking) && (query.length < options.minLength)) {
                    self.reset();
                    return;
                }

                self.query = query;

                $timeout.cancel(debouncedLoadId);
                debouncedLoadId = $timeout(function() {
                    var params = {
                        keywords: query,
                        families: families
                    },
                        promise = loadFn({
                            $query: params
                        });

                    lastPromise = promise;

                    promise.then(function(items) {
                        if (promise !== lastPromise) {
                            return;
                        }

                        self.items = getDifference(items.data || items, tags);
                        if (self.items.length > 0) {
                            self.show();
                        } else {
                            self.reset();
                        }
                    });
                }, options.debounceDelay, false);
            };

            self.selectNext = function() {
                if (self.index < self.items.length - 1) {
                    self.select(++self.index);
                }
            };

            self.selectPrior = function() {
                if (self.index > 0) {
                    self.select(--self.index);
                }
            };

            self.select = function(index) {
                self.index = index;
                self.selected = self.items[index];
            };

            self.reset();

            return self;
        }

        return {
            restrict: 'AE',
            require: '^tagsInput',
            scope: {
                source: '&',
                families: '=',
                loadOnClick: '=',
                loadOnFocus: '='
            },
            templateUrl: 'cxTags/auto-complete.html',
            link: function(scope, element, attrs, tagsInputCtrl) {
                var hotkeys = [KEYS.enter, KEYS.tab, KEYS.escape, KEYS.up, KEYS.down],
                    suggestionList,
                    tagsInput,
                    markdown,
                    container = {top: 0},
                    wrapper = {top: 0},
                    scroll = {
                        move: function(origin, moveForward) {
                            var el = document.getElementById('suggestion-item-' + suggestionList.index),
                                step = (el) ? el.offsetHeight : 0,
                                scroll;

                            container.el = element.find('ul')[0];
                            container.height = container.el.clientHeight;
                            wrapper.el = element.find('div')[0];
                            wrapper.height = wrapper.el.clientHeight;

                            if (moveForward) {
                                if ((container.top - step) < -(container.height - wrapper.height)) {
                                    container.top = -(container.height - wrapper.height + 10);
                                } else {
                                    container.top -= step;
                                }
                            } else {
                                if ((container.top + step) > 0) {
                                    container.top = 0;
                                } else {
                                    container.top += step;
                                }
                            }

                            angular.element(container.el).css('top', container.top + 'px');

                        },
                        reset: function () {
                            container.top = 0;
                            angular.element(container.el).css('top', container.top + 'px');
                        }
                    };

                tagsInputConfig.load('autoComplete', scope, attrs, {
                    debounceDelay: [Number, 100],
                    minLength: [Number, (scope.loadOnClick || scope.loadOnFocus) ? 0 : 3],
                    highlightMatchedText: [Boolean, true],
                    maxResultsToShow: [Number, (scope.loadOnClick || scope.loadOnFocus) ? 1000000 : 10]
                });

                tagsInput = tagsInputCtrl.registerAutocomplete();
                suggestionList = new SuggestionList(scope.source, scope.families, scope.options);

                scope.suggestionList = suggestionList;

                scope.addSuggestion = function() {
                    var added = false;

                    if (suggestionList.selected) {
                        tagsInput.tryAddTag(suggestionList.selected);
                        suggestionList.reset();
                        tagsInput.focusInput();

                        added = true;
                    }
                    return added;
                };

                tagsInput
                    .on(EVENT.inputChange, function(value) {
                        scope.inputValue = value;
                        if (value) {
                            suggestionList.load(value, tagsInput.getTags());
                            scroll.reset();
                        } else {
                            suggestionList.reset();
                            scroll.reset();
                        }
                    })
                    .on(EVENT.inputClick, function(e) {
                        scroll.reset();
                        if (scope.loadOnClick) {
                            suggestionList.load('', tagsInput.getTags(), true);
                        }
                    })
                    .on(EVENT.inputFocus, function(e) {
                        scroll.reset();
                        if (scope.loadOnFocus) {
                            suggestionList.load('', tagsInput.getTags(), true);
                        }
                    })
                    .on(EVENT.inputKeyDown, function(e) {

                        var key, handled;

                        if (hotkeys.indexOf(e.keyCode) === -1) {
                            return;
                        }

                        // This hack is needed because jqLite doesn't implement stopImmediatePropagation properly.
                        // I've sent a PR to Angular addressing this issue and hopefully it'll be fixed soon.
                        // https://github.com/angular/angular.js/pull/4833
                        var immediatePropagationStopped = false;
                        e.stopImmediatePropagation = function() {
                            immediatePropagationStopped = true;
                            e.stopPropagation();
                        };
                        e.isImmediatePropagationStopped = function() {
                            return immediatePropagationStopped;
                        };

                        if (suggestionList.visible) {
                            key = e.keyCode;
                            handled = false;

                            if (key === KEYS.down) {
                                scroll.move(suggestionList.index, true);
                                suggestionList.selectNext();
                                handled = true;
                            } else if (key === KEYS.up) {
                                scroll.move(suggestionList.index, false);
                                suggestionList.selectPrior();
                                handled = true;
                            } else if (key === KEYS.escape) {
                                scroll.reset();
                                suggestionList.reset();
                                handled = true;
                            } else if (key === KEYS.enter || key === KEYS.tab) {
                                handled = scope.addSuggestion();
                            }

                            if (handled) {
                                e.preventDefault();
                                e.stopImmediatePropagation();
                                scope.$apply();
                            }
                        }
                    })
                    .on(EVENT.inputBlur, function() {
                        suggestionList.reset();
                    });

                $document.on('click', function() {
                    if (suggestionList.visible) {
                        suggestionList.reset();
                        scope.$apply();
                    }
                });
            }
        };
    }
])

.filter('filterAttributes', [

    function() {
        return function(input) {
            var result = angular.copy(input);
            if (result.examples) {
                delete result.examples;
            }
            if (input.compassId) {
                delete result.compassId;
            }
            return result;
        };
    }
]);


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


/**
 * @ngDoc directive
 * @name tagsInput.directive:tiAutosize
 *
 * @description
 * Automatically sets the input's width so its content is always visible. Used internally by tagsInput directive.
 */
cxTags.directive('tiAutosize', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ctrl) {
            var span, resize;

            span = angular.element('<span class="tag-input"></span>');
            span.css('display', 'none')
                .css('visibility', 'hidden')
                .css('width', 'auto');

            element.parent().append(span);

            resize = function(value) {
                var originalValue = value;

                if (angular.isString(value) && value.length === 0) {
                    value = element.attr('placeholder');
                }
                span.text(value);
                span.css('display', '');
                try {
                    element.css('width', span.prop('offsetWidth') + 'px');
                }
                finally {
                    span.css('display', 'none');
                }

                return originalValue;
            };

            ctrl.$parsers.unshift(resize);
            ctrl.$formatters.unshift(resize);
        }
    };
});


/*globals console: true*/
/*** data-ng-tag-highlight ***********************************************************************************************
 *
 * Provides highlight for matched text inside tag attributes
 *
 ***********************************************************************************************************************/
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


/**
 * @ngdoc provider
 * @name tagsInput.provider:tagsInputConfig
 *
 * @description
 * Sets global default configuration options for tagsInput and autoComplete directives. It's also used internally to parse and
 * initialize options from HTML attributes.
 */
cxTags.provider('tagsInputConfig', function() {
    var globalDefaults = {};

    /**
     * @ngdoc function
     * @name setDefaults
     * @description Sets the default configuration option for a directive.
     *
     * @param {string} directive Name of the directive to be configured. Must be either 'tagsInput' or 'autoComplete'.
     * @param {object} defaults Object containing options and their values.
     *
     * @returns {object} The service itself for chaining purposes.
     */
    this.setDefaults = function(directive, defaults) {
        globalDefaults[directive] = defaults;
        return this;
    };

    this.$get = ["$interpolate", function($interpolate) {
        var converters = {};
        converters[String] = function(value) { return value; };
        converters[Number] = function(value) { return parseInt(value, 10); };
        converters[Boolean] = function(value) { return value.toLowerCase() === 'true'; };
        converters[RegExp] = function(value) { return new RegExp(value); };

        return {
            load: function(directive, scope, attrs, options) {
                scope.options = {};

                angular.forEach(options, function(value, key) {
                    var interpolatedValue = attrs[key] && $interpolate(attrs[key])(scope.$parent),
                        converter = converters[value[0]],
                        getDefault = function(key) {
                            var globalValue = globalDefaults[directive] && globalDefaults[directive][key];
                            return angular.isDefined(globalValue) ? globalValue : value[1];
                        };

                    scope.options[key] = interpolatedValue ? converter(interpolatedValue) : getDefault(key);
                });
            }
        };
    }];
});


/* HTML templates */
cxTags.run(["$templateCache", function($templateCache) {
    $templateCache.put('cxTags/tags-input.html',
    "<div class=\"ngTagsInput ctx-tags\" tabindex=\"-1\" ng-class=\"options.customClass\" ti-transclude-append=\"\"><div class=\"tags\" ng-class=\"{focused: hasFocus}\"><ul class=\"tag-list\" ng-if=\"!hideTags\"><li class=\"tag-item\" ng-repeat=\"tag in tags\" ng-class=\"getCssClass($index)\"><span>{{tag.label}}</span> <button type=\"button\" ng-click=\"remove($index)\">{{options.removeTagSymbol}}</button></li></ul><input class=\"tag-input\" id=\"{{ id }}\" placeholder=\"{{options.placeholder}}\" maxlength=\"{{options.maxLength}}\" tabindex=\"{{options.tabindex}}\" ng-model=\"newTag\" ng-change=\"newTagChange()\" ti-autosize=\"\"></div></div>"
  );

  $templateCache.put('cxTags/auto-complete.html',
    "<div class=\"autocomplete\" ng-show=\"suggestionList.visible\"><ul class=\"suggestion-list\"><li id=\"suggestion-item-{{ $index }}\" class=\"suggestion-item\" ng-repeat=\"item in suggestionList.items\" ng-class=\"{selected: item == suggestionList.selected}\" ng-click=\"addSuggestion()\" ng-mouseenter=\"suggestionList.select($index)\"><ul><li class=\"tag-label\" data-ng-tag-highlight=\"{{ item.label }}\"></li><li class=\"tag-family\" data-ng-tag-highlight=\"{{ item.family }}\"></li><li class=\"tag-description\" ng-if=\"item.description && item.description.length > 0\">: <span class=\"tag-attribute-value\" data-ng-tag-highlight=\"{{ item.description }}\"></span></li><li class=\"attributes\"><ul><li ng-repeat=\"(key, value) in item.attributes | filterAttributes \" class=\"tag-attribute\"><span class=\"tag-attribute-key\">{{ key }}</span> <span class=\"tag-attribute-value\" data-ng-tag-highlight=\"{{ value }}\"></span></li></ul></li><li class=\"tag-examples\" ng-if=\"item.attributes && item.attributes.examples && (item.attributes.examples.length > 0)\"><span class=\"tag-attribute-key\">Examples</span> <span class=\"tag-attribute-value\" data-ng-tag-highlight=\"{{ item.attributes.examples }}\"></span></li></ul></li></ul></div>"
  );

  $templateCache.put('cxTags/tag-list.html',
    "<span class=\"cx-tag-list\"><ul class=\"tag-list\"><li class=\"tag-item\" ng-repeat=\"tag in tagList\" ng-class=\"{locked: tag.locked}\"><span>{{tag.label}}</span> <button type=\"button\" data-ng-if=\"removeEnabled && !tag.locked\" ng-click=\"remove($index)\">×</button></li></ul></span>"
  );
}]);

}());