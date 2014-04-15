/*globals console: true*/
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
    'tagsInputConfig',
    function($document, $timeout, $sce, tagsInputConfig) {

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

            self.load = function(query, tags) {

                if (query.length < options.minLength) {
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
                self.select(++self.index);
            };
            self.selectPrior = function() {
                self.select(--self.index);
            };
            self.select = function(index) {
                if (index < 0) {
                    index = self.items.length - 1;
                } else if (index >= self.items.length) {
                    index = 0;
                }
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
                families: '='
            },
            templateUrl: 'cxTags/auto-complete.html',
            link: function(scope, element, attrs, tagsInputCtrl) {
                var hotkeys = [KEYS.enter, KEYS.tab, KEYS.escape, KEYS.up, KEYS.down],
                    suggestionList, tagsInput, markdown;

                tagsInputConfig.load('autoComplete', scope, attrs, {
                    debounceDelay: [Number, 100],
                    minLength: [Number, 3],
                    highlightMatchedText: [Boolean, true],
                    maxResultsToShow: [Number, 10]
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
                    .on('input-change', function(value) {
                        scope.inputValue = value;
                        if (value) {
                            suggestionList.load(value, tagsInput.getTags());
                        } else {
                            suggestionList.reset();
                        }
                    })
                    .on('input-keydown', function(e) {
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
                                suggestionList.selectNext();
                                handled = true;
                            } else if (key === KEYS.up) {
                                suggestionList.selectPrior();
                                handled = true;
                            } else if (key === KEYS.escape) {
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
                    .on('input-blur', function() {
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
]);
