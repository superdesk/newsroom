import {get} from 'lodash';
import {createSelector} from 'reselect';

export const formats = (state) => get(state, 'formats') || [];
export const secondaryFormats = (state) => get(state, 'secondaryFormats') || [];
export const context = (state) => get(state, 'context') || null;
export const userSectionsSelector = (state) => get(state, 'userSections');
export const modalItems = (state) => get(state, 'modal.data.items') || [];

export const getFormats = createSelector([formats],(f) => (f.map((format) =>
    ({value: format.format, text: format.name}))));

export const getContextName = createSelector(
    [context, userSectionsSelector],
    (currentSection, sections) => get(sections, `${currentSection}.name`)
);

export const modalOptions = createSelector(
    [modalItems, formats, context],
    (items, fmts, cntxt) => {
        let options = fmts;
        if (items && items.length) {
            const itemType = cntxt === 'agenda' ? 'agenda' : 'wire';
            options = options.filter((opt) => get(opt, 'types', ['wire', 'agenda']).includes(itemType));
        }

        return options.map((format) => ({value: format.format, text: format.name}));
    }
);

export const modalSecondaryFormatOptions = createSelector(
    [secondaryFormats], (fmts) => ( fmts.map((format) => ({value: format.format, text: format.name})) )
);
