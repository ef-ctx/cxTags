'use strict';

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

cxTags.constant('DEFAULT_VALUES', {
    tagMinLength: 2,
    isDropdown: false,
    placeholder: 'Add a tag'
});
