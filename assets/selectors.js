import {get} from 'lodash';
import {createSelector} from 'reselect';

export const formats = (state) => get(state, 'formats') || [];
export const context = (state) => get(state, 'context') || null;

export const userSectionsSelector = (state) => get(state, 'userSections');

export const getFormats = createSelector([formats],(f) => (f.map((format) =>
    ({value: format.format, text: format.name}))));

export const getContextName = createSelector(
    [context, userSectionsSelector],
    (currentSection, sections) => get(sections, `${currentSection}.name`)
);
