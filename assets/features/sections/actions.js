
export const INIT_SECTIONS = 'INIT_SECTIONS';
export function initSections(sections) {
    return {type: INIT_SECTIONS, sections: sections};
}

export const SELECT_SECTION = 'SELECT_SECTION';
export function selectSection(section) {
    return {type: SELECT_SECTION, section: section};
}
