import {gettext} from '../utils';
import {
    bookmarkItems,
    previewAndCopy,
    downloadItems,
    openItem,
    printItem,
    removeBookmarks,
    shareItems
} from './actions';

export function getItemActions(dispatch) {
    return [
        {
            id: 'open',
            name: gettext('Open'),
            icon: 'text',
            when: (state) => !state.itemToOpen,
            action: (item) => dispatch(openItem(item)),
        },
        {
            name: gettext('Share'),
            icon: 'share',
            multi: true,
            shortcut: true,
            visited: (user, item) => user && item && item.shares &&  item.shares.includes(user),
            when: (state) => state.user && state.company,
            action: (items) => dispatch(shareItems(items)),
        },
        {
            name: gettext('Print'),
            icon: 'print',
            visited: (user, item) => user && item && item.prints &&  item.prints.includes(user),
            action: (item) => dispatch(printItem(item)),
        },
        {
            name: gettext('Copy'),
            icon: 'copy',
            visited: (user, item) => user && item && item.copies &&  item.copies.includes(user),
            action: (item) => dispatch(previewAndCopy(item)),
        },
        {
            name: gettext('Download'),
            icon: 'download',
            multi: true,
            visited: (user, item) => user && item && item.downloads &&  item.downloads.includes(user),
            when: (state) => state.user && state.company,
            action: (items) => dispatch(downloadItems(items)),
        },
        {
            name: gettext('Save'),
            icon: 'bookmark-add',
            multi: true,
            shortcut: true,
            when: (state, item) => state.user && (!item || !item.bookmarks ||  !item.bookmarks.includes(state.user)),
            action: (items) => dispatch(bookmarkItems(items)),
        },
        {
            name: gettext('Unsave'),
            icon: 'bookmark-remove',
            multi: true,
            shortcut: true,
            when: (state, item) => state.user && item && item.bookmarks && item.bookmarks.includes(state.user),
            action: (items) => dispatch(removeBookmarks(items)),
        },
    ];
}
