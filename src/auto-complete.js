'use strict';

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
