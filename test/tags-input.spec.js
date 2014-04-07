/*jshint -W087 */
'use strict';

describe('tags-input-directive', function() {
    var $compile, $scope, $timeout, $document,
        isolateScope, element;

    beforeEach(function() {
        module('ngTagsInput');

        inject(function(_$compile_, _$rootScope_, _$document_, _$timeout_) {
            $compile = _$compile_;
            $scope = _$rootScope_;
            $document = _$document_;
            $timeout = _$timeout_;
        });
    });

    function compile() {
        var options = jQuery.makeArray(arguments).join(' ');
        var template = '<span data-tags-input ng-model="tags" ' + options + '></span>';

        element = $compile(template)($scope);
        $scope.$digest();
        isolateScope = element.isolateScope();
    }

    function compileWithForm() {
        var options = jQuery.makeArray(arguments).join(' ');
        var template = '<form name="form"><span data-tags-input ng-model="tags" ' + options + '></span></form>';

        element = $compile(template)($scope);
        $scope.$digest();
        isolateScope = element.isolateScope();
    }

    function getTags() {
        return element.find('li');
    }

    function getTag(index) {
        return getTags().eq(index);
    }

    function getTagText(index) {
        return getTag(index).find('span').html();
    }

    function getInput() {
        return element.find('input');
    }

    function newTag(tag, key) {
        key = key || KEYS.enter;

        for(var i = 0; i < tag.length; i++) {
            sendKeyPress(tag.charCodeAt(i));
        }
        sendKeyDown(key);
    }

    function sendKeyPress(charCode) {
        var input = getInput();
        var event = jQuery.Event('keypress', { charCode: charCode });

        input.trigger(event);
        if (!event.isDefaultPrevented()) {
            input.val(input.val() + String.fromCharCode(charCode));
            input.trigger('input');
        }
    }

    function sendKeyDown(keyCode, properties) {
        var event = jQuery.Event('keydown', angular.extend({ keyCode: keyCode }, properties || {}));
        getInput().trigger(event);

        return event;
    }

    function sendBackspace() {
        var event = sendKeyDown(KEYS.backspace);
        if (!event.isDefaultPrevented()) {
            var input = getInput();
            var value = input.val();
            input.val(value.substr(0, value.length - 1));
            input.trigger('input');
        }
    }

    describe('basic features', function() {
        it('renders the correct number of tags', function() {
            // Arrange
            $scope.tags = [{id:0, label:'some'},{id:1, label:'cool'},{id:2, label:'tags'}];

            // Act
            compile();

            // Assert
            expect(getTags().length).toBe(3);
            expect(getTagText(0)).toBe('some');
            expect(getTagText(1)).toBe('cool');
            expect(getTagText(2)).toBe('tags');
        });

        it('removes a tag when the remove button is clicked', function() {
            // Arrange
            $scope.tags = ['some','cool','tags'];
            compile();

            // Act
            element.find('button').click();

            // Assert
            expect($scope.tags).toEqual([]);
        });

        it('sets focus on the input field when the container div is clicked', function() {
            // Arrange
            compile();
            var input = getInput()[0];
            spyOn(input, 'focus');

            // /Act
            element.find('div').click();

            // Assert
            expect(input.focus).toHaveBeenCalled();
        });

        it('adds a custom CSS class to the container div when custom-class option is provided', function() {
            // Arrange/Act
            compile('custom-class="myClass"');

            // Arrange
            expect(element.find('div').hasClass('myClass')).toBe(true);
        });
    });

    describe('focus outline', function() {
        beforeEach(function() {
            compile();
        });

        it('outlines the tags div when the focused property is true', function() {
            // Arrange
            isolateScope.hasFocus = true;

            // Act
            $scope.$digest();

            // Assert
            expect(element.find('div.tags').hasClass('focused')).toBe(true);
        });

        it('does not outline the tags div when the focused property is false', function() {
            // Arrange
            isolateScope.hasFocus = false;

            // Act
            $scope.$digest();

            // Assert
            expect(element.find('div.tags').hasClass('focused')).toBe(false);
        });

        it('sets the focused property to true when the input field gains focus', function() {
            // Arrange
            isolateScope.hasFocus = false;
            spyOn($scope, '$digest');

            // Act
            getInput().triggerHandler('focus');

            // Assert
            expect(isolateScope.hasFocus).toBe(true);
            expect($scope.$digest).toHaveBeenCalled();
        });

        it('sets the focused property to false when the input field loses focus', function() {
            // Arrange
            var body = $document.find('body');
            body.append(element);
            body.focus();

            isolateScope.hasFocus = true;
            spyOn($scope, '$digest');

            // Act
            getInput().triggerHandler('blur');
            $timeout.flush();

            // Assert
            expect(isolateScope.hasFocus).toBe(false);
            expect($scope.$digest).toHaveBeenCalled();
        });

        it('does not trigger a digest cycle when the input field is focused already', function() {
            // Arrange
            isolateScope.hasFocus = true;
            spyOn($scope, '$digest');

            // Act
            getInput().triggerHandler('focus');

            // Assert
            expect($scope.$digest).not.toHaveBeenCalled();
        });
    });
    
    describe('tabindex option', function() {
        it('sets the input field tab index', function() {
            // Arrange/Act
            compile('tabindex="1"');

            // Assert
            expect(getInput().attr('tabindex')).toBe('1');
        });
    });

    describe('placeholder option', function() {
        it('sets the input field placeholder text', function() {
            // Arrange/Act
            compile('placeholder="New tag"');

            // Assert
            expect(getInput().attr('placeholder')).toBe('New tag');
        });

        it('initializes the option to "Add a tag"', function() {
            // Arrange/Act
            compile();

            // Assert
            expect(isolateScope.options.placeholder).toBe('Add a tag');
        });
    });

    describe('remove-tag-symbol option', function() {
        it('sets the remove button text', function() {
            // Arrange/Act
            $scope.tags = ['foo'];

            // Act
            compile('remove-tag-symbol="X"');

            // Assert
            expect(element.find('button').html()).toBe('X');
        });

        it('initializes the option to charcode 215 (&times;)', function() {
            // Arrange/Act
            compile();

            // Assert
            expect(isolateScope.options.removeTagSymbol).toBe(String.fromCharCode(215));
        });
    });


    describe('max-length option', function() {
        it('sets the maxlength attribute of the input field to max-length option', function() {
            // Arrange/Act
            compile('max-length="10"');

            // Assert
            expect(getInput().attr('maxlength')).toBe('10');
        });

        it('initializes the option to empty', function() {
            // Arrange/Act
            compile();

            // Assert
            expect(getInput().attr('maxlength')).toBe('');
        });
    });

    describe('enable-editing-last-tag option', function() {
        beforeEach(function() {
            $scope.tags = ['some','cool','tags'];
        });

        it('initializes the option to false', function() {
            // Arrange/Act
            compile();

            // Assert
            expect(isolateScope.options.enableEditingLastTag).toBe(false);
        });

        describe('option is on', function() {
            beforeEach(function() {
                compile('enable-editing-last-tag="true"');
            });

            describe('backspace is pressed once', function() {
                it('moves the last tag back into the input field when the input field is empty', function() {
                    // Act
                    sendBackspace();

                    // Assert
                    expect(getInput().val()).toBe('tags');
                    expect($scope.tags).toEqual(['some','cool']);
                });

                it('does nothing when the input field is not empty', function() {
                    // Act
                    sendKeyPress(65);
                    sendBackspace();

                    // Assert
                    expect($scope.tags).toEqual(['some','cool','tags']);
                });
            });
        });

        describe('option is off', function() {
            beforeEach(function() {
                compile('enable-editing-last-tag="false"');
            });

            describe('backspace is pressed once', function() {
                it('highlights the tag about to be removed when the input box is empty', function() {
                    // Act
                    sendBackspace();

                    // Assert
                    expect(getTag(2).hasClass('selected')).toBe(true);
                });

                it('does nothing when the input field is not empty', function() {
                    // Act
                    sendKeyPress(65);
                    sendBackspace();

                    // Assert
                    expect($scope.tags).toEqual(['some','cool','tags']);
                });

                it('stops highlighting the last tag when the input box becomes non-empty', function() {
                    // Act
                    sendBackspace();
                    sendKeyPress(65);

                    // Assert
                    expect(getTag(2).hasClass('selected')).toBe(false);
                });
            });

            describe('backspace is pressed twice', function() {
                it('removes the last tag when the input field is empty', function() {
                    // Act
                    sendBackspace();
                    sendBackspace();

                    // Assert
                    expect(getInput().val()).toBe('');
                    expect($scope.tags).toEqual(['some','cool']);
                });

                it('does nothing when the input field is not empty', function() {
                    // Act
                    sendKeyPress(65);
                    sendBackspace();
                    sendBackspace();

                    // Assert
                    expect($scope.tags).toEqual(['some','cool','tags']);
                });
            });
        });
    });

    describe('min-tags option', function() {
        it('initializes the option to undefined', function() {
            // Arrange/Act
            compile();

            // Assert
            expect(isolateScope.options.minTags).toBeUndefined();
        });

        it('makes the element invalid when the number of tags is less than the min-tags option', function() {
            // Arrange
            compileWithForm('min-tags="3"', 'name="tags"');

            // Act
            $scope.tags = ['Tag1', 'Tag2'];
            $scope.$digest();

            // Assert
            expect($scope.form.tags.$invalid).toBe(true);
            expect($scope.form.tags.$error.minTags).toBe(true);
        });

        it('makes the element valid when the number of tags is not less than the min-tags option', function() {
            // Arrange
            compileWithForm('min-tags="2"', 'name="tags"');

            // Act
            $scope.tags = ['Tag1', 'Tag2'];
            $scope.$digest();

            // Assert
            expect($scope.form.tags.$valid).toBe(true);
            expect($scope.form.tags.$error.minTags).toBe(false);
        });

        it('makes the element valid when the max-tags option is undefined', function() {
            // Arrange
            compileWithForm('name="tags"');

            // Act
            $scope.tags = ['Tag1', 'Tag2', 'Tags3', 'Tags4', 'Tags5'];
            $scope.$digest();

            // Assert
            expect($scope.form.tags.$valid).toBe(true);
            expect($scope.form.tags.$error.minTags).toBe(false);
        });
    });


    describe('max-tags option', function() {
        it('initializes the option to undefined', function() {
            // Arrange/Act
            compile();

            // Assert
            expect(isolateScope.options.maxTags).toBeUndefined();
        });

        it('makes the element invalid when the number of tags is greater than the max-tags option', function() {
            // Arrange
            compileWithForm('max-tags="2"', 'name="tags"');

            // Act
            $scope.tags = ['Tag1', 'Tag2', 'Tag3'];
            $scope.$digest();

            // Assert
            expect($scope.form.tags.$invalid).toBe(true);
            expect($scope.form.tags.$error.maxTags).toBe(true);
        });

        it('makes the element valid when the number of tags is not greater than the max-tags option', function() {
            // Arrange
            compileWithForm('max-tags="2"', 'name="tags"');

            // Act
            $scope.tags = ['Tag1', 'Tag2'];
            $scope.$digest();

            // Assert
            expect($scope.form.tags.$valid).toBe(true);
            expect($scope.form.tags.$error.maxTags).toBe(false);
        });

        it('makes the element valid when the max-tags option is undefined', function() {
            // Arrange
            compileWithForm('name="tags"');

            // Act
            $scope.tags = ['Tag1', 'Tag2', 'Tags3', 'Tags4', 'Tags5'];
            $scope.$digest();

            // Assert
            expect($scope.form.tags.$valid).toBe(true);
            expect($scope.form.tags.$error.maxTags).toBe(false);
        });
    });

    describe('on-tag-removed option', function () {
        it('calls the provided callback when a tag is removed by clicking the remove button', function() {
            // Arrange
            $scope.tags = ['some','cool','tags'];
            $scope.callback = jasmine.createSpy();
            compile('on-tag-removed="callback($tag)"');

            // Act
            element.find('button')[0].click();

            // Assert
            expect($scope.callback).toHaveBeenCalledWith('some');
        });

        it('calls the provided callback when the last tag is removed by pressing backspace twice', function() {
            // Arrange
            $scope.tags = ['some','cool','tags'];
            $scope.callback = jasmine.createSpy();
            compile('on-tag-removed="callback($tag)"');

            // Act
            sendBackspace();
            sendBackspace();

            // Assert
            expect($scope.callback).toHaveBeenCalledWith('tags');
        });
    });

    describe('autocomplete registration', function() {
        var autocompleteObj;

        beforeEach(function() {
            compile();
            autocompleteObj = element.controller('tagsInput').registerAutocomplete();
        });

        it('creates an object containing all the autocomplete directive needs to work', function() {
            expect(autocompleteObj).toEqual({
                tryAddTag: jasmine.any(Function),
                focusInput: jasmine.any(Function),
                on: jasmine.any(Function),
                getTags: jasmine.any(Function)
            });
        });

        it('focus the input box', function() {
            // Arrange
            var input = getInput()[0];
            spyOn(input, 'focus');

            // Act
            autocompleteObj.focusInput();

            // Assert
            expect(input.focus).toHaveBeenCalled();
        });

        it('returns the list of tags', function() {
            // Arrange
            $scope.tags = ['a', 'b', 'c'];
            $scope.$digest();

            // Act/Assert
            expect(autocompleteObj.getTags()).toEqual(['a', 'b', 'c']);
        });

        describe('events', function() {
            var callback;

            beforeEach(function() {
                callback = jasmine.createSpy();
            });

            it('triggers an event when a key is pressed down on the input', function() {
                // Arrange
                autocompleteObj.on('input-keydown', callback);

                // Act
                var event = sendKeyDown(65);

                // Assert
                expect(callback).toHaveBeenCalledWith(event);
            });

            it('triggers an event when the input content changes', function() {
                // Arrange
                autocompleteObj.on('input-change', callback);

                // Act
                getInput().val('ABC').trigger('input');

                // Assert
                expect(callback).toHaveBeenCalledWith('ABC');
            });

            it('triggers an event when the input loses focus', function() {
                // Arrange
                autocompleteObj.on('input-blur', callback);

                // Act
                getInput().trigger('blur');
                $timeout.flush();

                // Assert
                expect(callback).toHaveBeenCalled();
            });
        });
    });


    describe('hotkeys propagation handling', function() {
        var hotkeys;

        beforeEach(function() {
            compile('add-on-enter="true"', 'add-on-space="true"', 'add-on-comma="true"');
        });

        describe('modifier key is on', function() {
            beforeEach(function() {
                hotkeys = [KEYS.enter, KEYS.comma, KEYS.space, KEYS.backspace];
            });

            it('does not prevent any hotkey from being propagated when the shift key is down', function() {
                angular.forEach(hotkeys, function(key) {
                    expect(sendKeyDown(key, { shiftKey: true }).isDefaultPrevented()).toBe(false);
                });
            });

            it('does not prevent any hotkey from being propagated when the alt key is down', function() {
                angular.forEach(hotkeys, function(key) {
                    expect(sendKeyDown(key, { altKey: true }).isDefaultPrevented()).toBe(false);
                });
            });

            it('does not prevent any hotkey from being propagated when the ctrl key is down', function() {
                angular.forEach(hotkeys, function(key) {
                    expect(sendKeyDown(key, { ctrlKey: true }).isDefaultPrevented()).toBe(false);
                });
            });

            it('does not prevent any hotkey from being propagated when the meta key is down', function() {
                angular.forEach(hotkeys, function(key) {
                    expect(sendKeyDown(key, { metaKey: true }).isDefaultPrevented()).toBe(false);
                });
            });

        });

        describe('modifier key is off', function() {
            it('prevents enter, comma and space keys from being propagated when all modifiers are up', function() {
                // Arrange
                hotkeys = [KEYS.enter, KEYS.comma, KEYS.space];

                // Act/Assert
                angular.forEach(hotkeys, function(key) {
                    expect(sendKeyDown(key, {
                        shiftKey: false,
                        ctrlKey: false,
                        altKey: false,
                        metaKey: false
                    }).isDefaultPrevented()).toBe(true);
                });
            });

            it('prevents the backspace key from being propagated when all modifiers are up', function() {
                // Arrange
                isolateScope.tryRemoveLast = function() { return true; };

                // Act/Assert
                expect(sendKeyDown(KEYS.backspace).isDefaultPrevented()).toBe(true);
            });
        });
    });
});
