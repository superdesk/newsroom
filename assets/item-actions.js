import { gettext } from './utils';


export function getItemActions(dispatch, actions) {
    const {
        openItem,
        shareItems,
        printItem,
        previewAndCopy,
        downloadItems,
        bookmarkItems,
        removeBookmarks,
        removeItems,
    } = actions;


    return [
        {
            id: 'open',
            name: gettext('Open'),
            icon: 'text',
            when: (state) => !state.itemToOpen && !state.openItem,
            action: (item, group, plan) => dispatch(openItem(item, group, plan)),
        },
        {
            id: 'share',
            name: gettext('Share'),
            icon: 'share',
            multi: true,
            shortcut: true,
            visited: (user, item) => user && item && item.shares &&  item.shares.includes(user),
            when: (state) => state.user && state.company,
            action: (items) => dispatch(shareItems(items)),
        },
        {
            id: 'print',
            name: gettext('Print'),
            icon: 'print',
            visited: (user, item) => user && item && item.prints &&  item.prints.includes(user),
            action: (item) => dispatch(printItem(item)),
        },
        {
            id: 'copy',
            name: gettext('Copy'),
            icon: 'copy',
            visited: (user, item) => user && item && item.copies &&  item.copies.includes(user),
            action: (item) => dispatch(previewAndCopy(item)),
        },
        {
            id: 'download',
            name: gettext('Download'),
            icon: 'download',
            multi: true,
            visited: (user, item) => user && item && item.downloads &&  item.downloads.includes(user),
            when: (state) => state.user && state.company,
            action: (items) => dispatch(downloadItems(items)),
        },
        {
            id: 'save',
            name: gettext('Save'),
            icon: 'bookmark-add',
            multi: true,
            shortcut: true,
            when: (state, item) => state.user && (!item || !item.bookmarks ||  !item.bookmarks.includes(state.user)),
            action: (items) => dispatch(bookmarkItems(items)),
        },
        {
            id: 'unsave',
            name: gettext('Unsave'),
            icon: 'bookmark-remove',
            multi: true,
            shortcut: true,
            when: (state, item) => state.user && item && item.bookmarks && item.bookmarks.includes(state.user),
            action: (items) => dispatch(removeBookmarks(items)),
        },
        {
            id: 'remove',
            name: gettext('Remove'),
            icon: 'trash',
            multi: true,
            when: (state) => state.user && state.userType === 'administrator',
            action: (items) => removeItems(items),
        }
    ];
}
