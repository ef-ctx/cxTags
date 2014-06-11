'use strict';

describe('autocomplete-directive', function() {
    var $compile, $scope, $q, $timeout,
        parentCtrl, element, isolateScope, suggestionList, deferred, tagsInput, eventHandlers,
        mocks = {
            families: ['Topic'],
            tags: [{
                'description': 'Moving',
                'family': 'Topic',
                'locale': 'en_EN',
                'label': 'TO-XX-HHE-4-4',
                'attributes': {
                    'topic': 'Housing',
                    'theme': 'House & Home, Environment',
                    'examples': 'move, pack, relocate',
                    'compassId': 'TO-XX-HHE-4-4'
                },
                'id': 'VGFnAQAAAAA-NDg1AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
            }, {
                'description': 'Movie reviews / Movie making',
                'family': 'Topic',
                'locale': 'en_EN',
                'label': 'TO-XX-FTE-4-4',
                'attributes': {
                    'topic': 'Movies/TV',
                    'theme': 'Free Time and Entertainment  ',
                    'examples': 'acting, theme, plot, soundtrack, plot, characters, actor, director, special effects, costumes , subtitles, black and white, remake, bad acting, original, brilliant',
                    'compassId': 'TO-XX-FTE-4-4'
                },
                'id': 'VGFnAQAAAAA-NDE4AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
            }, {
                'description': 'Movie genres',
                'family': 'Topic',
                'locale': 'en_EN',
                'label': 'TO-XX-FTE-4-3',
                'attributes': {
                    'topic': 'Movies/TV',
                    'theme': 'Free Time and Entertainment  ',
                    'examples': 'horror, comedy, drama, romance, documentary, thriller, action, foreign, science fiction ',
                    'compassId': 'TO-XX-FTE-4-3'
                },
                'id': 'VGFnAQAAAAA-NDE3AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
            }, {
                'description': 'Awards',
                'family': 'Topic',
                'locale': 'en_EN',
                'label': 'TO-XX-FTE-4-1',
                'attributes': {
                    'topic': 'Movies/TV',
                    'theme': 'Free Time and Entertainment  ',
                    'examples': 'prize, nominee, supporting actor, speech',
                    'compassId': 'TO-XX-FTE-4-1'
                },
                'id': 'VGFnAQAAAAA-NDE1AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
            }, {
                'description': 'Celebrity news',
                'family': 'Topic',
                'locale': 'en_EN',
                'label': 'TO-XX-FTE-4-2',
                'attributes': {
                    'topic': 'Movies/TV',
                    'theme': 'Free Time and Entertainment  ',
                    'examples': 'divorce, gossip, scandal, tabloid',
                    'compassId': 'TO-XX-FTE-4-2'
                },
                'id': 'VGFnAQAAAAA-NDE2AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
            }, {
                'description': 'Television',
                'family': 'Topic',
                'locale': 'en_EN',
                'label': 'TO-XX-FTE-4-5',
                'attributes': {
                    'topic': 'Movies/TV',
                    'theme': 'Free Time and Entertainment  ',
                    'examples': 'cable TV, channels, couch potato, channel surf, episode, dialogue, sex, educational, entertainment, violence, restrictions, rating system',
                    'compassId': 'TO-XX-FTE-4-5'
                },
                'id': 'VGFnAQAAAAA-NDE5AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
            }, {
                'description': 'TV programs',
                'family': 'Topic',
                'locale': 'en_EN',
                'label': 'TO-XX-FTE-4-6',
                'attributes': {
                    'topic': 'Movies/TV',
                    'theme': 'Free Time and Entertainment  ',
                    'examples': 'sitcom, reality TV, presenter, documentary, news, reality show, weather, sitcom, science fiction, drama, game show, soap operas, sports',
                    'compassId': 'TO-XX-FTE-4-6'
                },
                'id': 'VGFnAQAAAAA-NDIwAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
            }]

        };

    beforeEach(function() {
        module('cxTags');

        inject(function($rootScope, _$compile_, _$q_, _$timeout_) {
            $scope = $rootScope;
            $compile = _$compile_;
            $q = _$q_;
            $timeout = _$timeout_;
        });

        //initialization for tags
        $scope.tags = [];
       
        deferred = $q.defer();
        eventHandlers = {};
        $scope.loadItems = jasmine.createSpy().andReturn(deferred.promise);

        compile();
    });

    function compile() {
        var parent, options;

        tagsInput = {
            changeInputValue: jasmine.createSpy(),
            tryAddTag: jasmine.createSpy(),
            focusInput: jasmine.createSpy(),
            on: jasmine.createSpy().andCallFake(function(name, handler) {
                eventHandlers[name] = handler;
                return this;
            }),
            getTags: jasmine.createSpy().andReturn([])
        };

        parent = $compile('<span data-tags-input ng-model="tags"></span>')($scope);
        $scope.$digest();

        parentCtrl = parent.controller('tagsInput');
        spyOn(parentCtrl, 'registerAutocomplete').andReturn(tagsInput);

        options = jQuery.makeArray(arguments).join(' ');
        element = angular.element('<span data-auto-complete source="loadItems($query)" category="categories" ' + options + '></span>');
        parent.append(element);

        $compile(element)($scope);
        $scope.$digest();

        isolateScope = element.isolateScope();
        suggestionList = isolateScope.suggestionList;
    }

    function resolve(items) {
        deferred.resolve(items);
        $scope.$digest();
    }

    function sendKeyDown(keyCode) {
        var event = jQuery.Event('keydown', {
            keyCode: keyCode
        });
        eventHandlers['input-keydown'](event);

        return event;
    }

    function changeInputValue(value) {
        eventHandlers['input-change'](value);
        $scope.$digest();
    }

    function getSuggestionsBox() {
        return element.find('div');
    }

    function getSuggestions() {
        return getSuggestionsBox().find('li.suggestion-item');
    }

    function getSuggestion(index) {
        return getSuggestions().eq(index);
    }

    function getSuggestionLabel(index) {
        return getSuggestion(index).find('li.tag-label').text();
    }

    function isSuggestionsBoxVisible() {
        return !getSuggestionsBox().hasClass('ng-hide');
    }

    function loadSuggestions(items, text) {
        suggestionList.load(text || 'foobar', tagsInput.getTags());
        $timeout.flush();
        resolve(items);
    }

    describe('basic features', function() {
        it('ensures that the suggestions list is hidden by default', function() {
            expect(isSuggestionsBoxVisible()).toBe(false);
        });

        it('renders all elements returned by the load function that aren\'t already added', function() {
            // Act
            tagsInput.getTags.andReturn([mocks.tags[0]]);
            loadSuggestions({ data: mocks.tags });

            // Assert
            expect(getSuggestions().length).toBe(mocks.tags.length - 1);
            expect(getSuggestionLabel(0)).toBe(mocks.tags[1].label);
            expect(getSuggestionLabel(1)).toBe(mocks.tags[2].label);
            expect(getSuggestionLabel(2)).toBe(mocks.tags[3].label);
        });

        it('shows the suggestions list when there are items to show', function() {
            // Act
            loadSuggestions([mocks.tags[0]]);

            // Assert
            expect(isSuggestionsBoxVisible()).toBe(true);
        });

        it('hides the suggestions list when there is no items to show', function() {
            // Arrange
            suggestionList.visible = true;

            // Act
            loadSuggestions([]);

            // Assert
            expect(isSuggestionsBoxVisible()).toBe(false);
        });

        it('hides the suggestions list when there is no items left to show', function() {
            // Act
            tagsInput.getTags.andReturn(mocks.tags);
            loadSuggestions(mocks.tags);

            // Assert
            expect(isSuggestionsBoxVisible()).toBe(false);
        });

        it('hides the suggestion box when the input field becomes empty', function() {
            // Arrange
            changeInputValue('foobar');
            suggestionList.show();
            $scope.$digest();

            // Act
            changeInputValue('');

            // Assert
            expect(isSuggestionsBoxVisible()).toBe(false);
        });

        it('hides the suggestion box when the escape key is pressed', function() {
            // Arrange
            suggestionList.show();
            $scope.$digest();

            // Act
            sendKeyDown(KEYS.escape);

            // Assert
            expect(isSuggestionsBoxVisible()).toBe(false);
        });

        it('hides the suggestion box when the user clicks elsewhere on the page', function() {
            // Arrange
            suggestionList.show();
            $scope.$digest();

            // Act
            $(document).trigger('click');

            // Assert
            expect(isSuggestionsBoxVisible()).toBe(false);
        });

        it('hides the suggestion box after adding the selected suggestion to the input field', function() {
            // Arrange
            loadSuggestions([mocks.tags[0], mocks.tags[1]]);
            suggestionList.select(0);

            // Act
            sendKeyDown(KEYS.enter);

            // Assert
            expect(isSuggestionsBoxVisible()).toBe(false);
        });

        it('hides the suggestion box when the input field loses focus', function() {
            // Arrange
            suggestionList.visible = true;

            // Act
            eventHandlers['input-blur']();

            // Assert
            expect(isSuggestionsBoxVisible()).toBe(false);
        });

        it('adds the selected suggestion when the enter key is pressed and the suggestions box is visible', function() {
            // Arrange
            loadSuggestions([mocks.tags[0], mocks.tags[1]]);
            suggestionList.select(0);

            // Act
            sendKeyDown(KEYS.enter);

            // Assert
            expect(tagsInput.tryAddTag).toHaveBeenCalledWith(mocks.tags[0]);
        });

        it('adds the selected suggestion when the tab key is pressed and there is a suggestion selected', function() {
            // Arrange
            loadSuggestions([mocks.tags[0], mocks.tags[1]]);
            suggestionList.select(0);

            // Act
            sendKeyDown(KEYS.tab);

            // Assert
            expect(tagsInput.tryAddTag).toHaveBeenCalledWith(mocks.tags[0]);
        });

        it('does not change the input value when the enter key is pressed and there is nothing selected', function() {
            // Arrange
            loadSuggestions([mocks.tags[0], mocks.tags[1]]);

            // Act
            sendKeyDown(KEYS.enter);

            // Assert
            expect(tagsInput.tryAddTag).not.toHaveBeenCalled();
        });

        it('sets the selected suggestion to null after adding it to the input field', function() {
            // Arrange
            loadSuggestions([mocks.tags[0], mocks.tags[1]]);
            suggestionList.select(0);

            // Act
            isolateScope.addSuggestion();

            // Assert
            expect(suggestionList.selected).toBeNull();
        });

        it('does not call the load function after adding the selected suggestion to the input field', function() {
            // Arrange
            loadSuggestions([mocks.tags[0], mocks.tags[1]]);
            suggestionList.select(0);

            // Act
            sendKeyDown(KEYS.enter);

            // Assert
            expect($scope.loadItems.callCount).toBe(1);
        });

        it('selects no suggestion after the suggestion box is shown', function() {
            // Arrange/Act
            loadSuggestions([mocks.tags[0], mocks.tags[1]]);

            // Assert
            expect(suggestionList.selected).toBeNull();
        });

        it('discards all load calls but the last one', function() {
            // Arrange
            var deferred1 = $q.defer(),
                deferred2 = $q.defer(),
                deferred3 = $q.defer();
            var promises = [deferred1.promise, deferred2.promise, deferred3.promise];

            $scope.loadItems = jasmine.createSpy().andCallFake(function() {
                return promises.shift();
            });
            spyOn(suggestionList, 'show');

            // Act
            // First we need to register all promises
            suggestionList.load('foobar', tagsInput.getTags());
            $timeout.flush();

            suggestionList.load('foobar', tagsInput.getTags());
            $timeout.flush();

            suggestionList.load('foobar', tagsInput.getTags());
            $timeout.flush();

            // Now we resolve each promise which was previously created
            deferred1.resolve([mocks.tags[0]]);
            deferred2.resolve([mocks.tags[1]]);
            deferred3.resolve([mocks.tags[2]]);

            $scope.$digest();

            // Assert
            expect(suggestionList.show.calls.length).toBe(1);
        });

        it('discards all load calls after the suggestion list is reset', function() {
            // Arrange
            spyOn(suggestionList, 'show');
            suggestionList.load('foobar', tagsInput.getTags());
            $timeout.flush();
            // Act
            suggestionList.reset();

            resolve([mocks.tags[2]]);

            // Assert
            expect(suggestionList.show).not.toHaveBeenCalled();
        });
    });

    describe('navigation through suggestions', function() {
        describe('downward', function() {
            it('selects the next suggestion when the down arrow key is pressed and there\'s something selected', function() {
                // Arrange
                loadSuggestions([mocks.tags[0], mocks.tags[1]]);
                suggestionList.select(0);

                // Act
                sendKeyDown(KEYS.down);

                // Assert
                expect(suggestionList.selected).toBe(mocks.tags[1]);
            });

        });

        describe('upward', function() {
            it('selects the prior suggestion when the down up key is pressed and there\'s something selected', function() {
                // Arrange
                loadSuggestions([mocks.tags[0], mocks.tags[1]]);
                suggestionList.select(1);

                // Act
                sendKeyDown(KEYS.up);

                // Assert
                expect(suggestionList.selected).toBe(mocks.tags[0]);
            });

        });

        describe('mouse', function() {
            it('selects the suggestion under the mouse pointer', function() {
                // Arrange
                loadSuggestions([mocks.tags[0], mocks.tags[1], mocks.tags[2]]);

                // Act
                getSuggestion(1).mouseenter();

                // Assert
                expect(suggestionList.selected).toBe(mocks.tags[1]);
            });

            it('adds the selected suggestion when a mouse click is triggered', function() {
                // Arrange
                loadSuggestions([mocks.tags[0], mocks.tags[1], mocks.tags[2]]);
                getSuggestion(1).mouseenter();

                // Act
                getSuggestion(1).click();

                // Assert
                expect(tagsInput.tryAddTag).toHaveBeenCalledWith(mocks.tags[1]);
            });

            it('focuses the input field when a suggestion is added via a mouse click', function() {
                // Arrange
                loadSuggestions([mocks.tags[0], mocks.tags[1], mocks.tags[2]]);
                suggestionList.select(0);

                // Act
                getSuggestion(1).click();

                // Assert
                expect(tagsInput.focusInput).toHaveBeenCalled();
            });
        });
    });

    describe('keys propagation handling', function() {
        describe('hotkeys - suggestion box is visible', function() {
            beforeEach(function() {
                suggestionList.show();
            });

            it('prevents the down arrow keydown event from being propagated', function() {
                // Act
                var event = sendKeyDown(KEYS.down);

                // Assert
                expect(event.isDefaultPrevented()).toBe(true);
                expect(event.isPropagationStopped()).toBe(true);
            });

            it('prevents the up arrow keydown event from being propagated', function() {
                // Act
                var event = sendKeyDown(KEYS.up);

                // Assert
                expect(event.isDefaultPrevented()).toBe(true);
                expect(event.isPropagationStopped()).toBe(true);
            });

            it('prevents the enter keydown event from being propagated if there is a suggestion selected', function() {
                // Arrange
                suggestionList.selected = 'suggestion';

                // Act
                var event = sendKeyDown(KEYS.enter);

                // Assert
                expect(event.isDefaultPrevented()).toBe(true);
                expect(event.isPropagationStopped()).toBe(true);
            });

            it('does not prevent the enter keydown event from begin propagated if there is no suggestion selected', function() {
                // Arrange
                suggestionList.selected = null;

                // Act
                var event = sendKeyDown(KEYS.enter);

                // Assert
                expect(event.isDefaultPrevented()).toBe(false);
                expect(event.isPropagationStopped()).toBe(false);
            });

            it('prevents the tab keydown event from being propagated if there is a suggestion selected', function() {
                // Arrange
                suggestionList.selected = 'suggestion';

                // Act
                var event = sendKeyDown(KEYS.tab);

                // Assert
                expect(event.isDefaultPrevented()).toBe(true);
                expect(event.isPropagationStopped()).toBe(true);
            });

            it('does not prevent the tab keydown event from being propagated if there is no suggestion selected', function() {
                // Arrange
                suggestionList.selected = null;

                // Act
                var event = sendKeyDown(KEYS.tab);

                // Assert
                expect(event.isDefaultPrevented()).toBe(false);
                expect(event.isPropagationStopped()).toBe(false);
            });

            it('prevents the escape keydown event from being propagated', function() {
                // Act
                var event = sendKeyDown(KEYS.escape);

                // Assert
                expect(event.isDefaultPrevented()).toBe(true);
                expect(event.isPropagationStopped()).toBe(true);
            });
        });

        describe('hotkeys - suggestion box is hidden', function() {
            beforeEach(function() {
                suggestionList.reset();
            });

            it('does not prevent the down arrow keydown event from being propagated', function() {
                // Act
                var event = sendKeyDown(KEYS.down);

                // Assert
                expect(event.isDefaultPrevented()).toBe(false);
                expect(event.isPropagationStopped()).toBe(false);
            });

            it('does not prevent the up arrow keydown event from being propagated', function() {
                // Act
                var event = sendKeyDown(KEYS.up);

                // Assert
                expect(event.isDefaultPrevented()).toBe(false);
                expect(event.isPropagationStopped()).toBe(false);
            });

            it('does not prevent the enter keydown event from being propagated', function() {
                // Act
                var event = sendKeyDown(KEYS.enter);

                // Assert
                expect(event.isDefaultPrevented()).toBe(false);
                expect(event.isPropagationStopped()).toBe(false);
            });

            it('does not prevent the tab keydown event from being propagated', function() {
                // Act
                var event = sendKeyDown(KEYS.tab);

                // Assert
                expect(event.isDefaultPrevented()).toBe(false);
                expect(event.isPropagationStopped()).toBe(false);
            });

            it('does not prevent the escape keydown event from being propagated', function() {
                // Act
                var event = sendKeyDown(KEYS.escape);

                // Assert
                expect(event.isDefaultPrevented()).toBe(false);
                expect(event.isPropagationStopped()).toBe(false);
            });
        });

        describe('non-hotkeys', function() {
            it('does not prevent non-hotkeys keystrokes from being propagated', function() {
                // Act
                var events = [sendKeyDown(65), sendKeyDown(66), sendKeyDown(67)];

                // Assert
                expect(events[0].isDefaultPrevented()).toBe(false);
                expect(events[0].isPropagationStopped()).toBe(false);

                expect(events[1].isDefaultPrevented()).toBe(false);
                expect(events[1].isPropagationStopped()).toBe(false);

                expect(events[2].isDefaultPrevented()).toBe(false);
                expect(events[2].isPropagationStopped()).toBe(false);
            });
        });
    });

    describe('debounce-delay option', function() {
        it('initializes the option to 100 milliseconds', function() {
            // Arrange/Act
            compile();

            // Assert
            expect(isolateScope.options.debounceDelay).toBe(100);
        });

        it('doesn\'t call the load function immediately', function() {
            // Arrange
            compile('debounce-delay="100"');

            // Act
            changeInputValue('A');
            changeInputValue('AB');
            changeInputValue('ABC');

            // Assert
            expect($scope.loadItems).not.toHaveBeenCalled();
        });

        it('calls the load function only after a delay has passed', function() {
            // Arrange
            compile('debounce-delay="100"');

            // Act
            changeInputValue('A');
            changeInputValue('AB');
            changeInputValue('ABC');

            $timeout.flush(100);

            // Assert
            expect($scope.loadItems).toHaveBeenCalledWith({
                keywords: 'ABC',
                category: undefined
            });
        });

        it('doesn\'t call the load function when the reset method is called', function() {
            // Arrange
            compile();
            changeInputValue('A');

            // Act
            suggestionList.reset();
            $timeout.flush();

            // Assert
            expect($scope.loadItems).not.toHaveBeenCalled();
        });
    });

    describe('min-length option', function() {
        it('initializes the option to 3', function() {
            // Arrange/Act
            compile();

            // Assert
            expect(isolateScope.options.minLength).toBe(3);
        });

        it('calls the load function only after the minimum amount of characters has been entered', function() {
            // Arrange
            compile('min-length="3"');

            // Act
            changeInputValue('A');
            changeInputValue('AB');
            changeInputValue('ABC');

            $timeout.flush();

            // Assert
            expect($scope.loadItems.calls.length).toBe(1);
            expect($scope.loadItems.calls[0].args[0]).toEqual({
                keywords: 'ABC',
                category: undefined
            });
        });

        it('doesn\'t call the load function when the minimum amount of characters isn\'t entered', function() {
            // Arrange
            compile('min-length="3"');

            // Act
            changeInputValue('A');
            changeInputValue('AB');

            $timeout.flush();

            // Assert
            expect($scope.loadItems).not.toHaveBeenCalled();
        });

        it('hides the suggestion box when the number of entered characters is less than the option value', function() {
            // Arrange
            compile('min-length="5"');
            suggestionList.show();

            // Act
            changeInputValue('ABCD');

            // Assert
            expect(isSuggestionsBoxVisible()).toBe(false);
        });
    });



});
