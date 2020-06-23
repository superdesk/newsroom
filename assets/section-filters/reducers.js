import {
    GET_SECTION_FILTERS,
    SELECT_SECTION_FILTER,
    EDIT_SECTION_FILTER,
    QUERY_SECTION_FILTERS,
    CANCEL_EDIT,
    NEW_SECTION_FILTER,
    SET_ERROR,
} from './actions';
import {ADD_EDIT_USERS} from 'actions';

import {INIT_SECTIONS, SELECT_SECTION} from 'features/sections/actions';
import {sectionsReducer} from 'features/sections/reducers';
import {searchReducer} from 'search/reducers';

const initialState = {
    query: null,
    sectionFilters: [],
    sectionFiltersById: {},
    activeSectionFilterId: null,
    isLoading: false,
    totalSectionFilters: null,
    activeQuery: null,
    sections: sectionsReducer(),
    search: searchReducer,
};

export default function sectionFiltersReducer(state = initialState, action) {
    switch (action.type) {

    case SELECT_SECTION_FILTER: {
        const defaultSectionFilter = {
            is_enabled: true,
            name: '',
            description: '',
        };

        return {
            ...state,
            activeSectionFilterId: action.id || null,
            sectionFilterToEdit: action.id ? Object.assign(defaultSectionFilter, state.sectionFiltersById[action.id]) : null,
            errors: null,
        };
    }

    case EDIT_SECTION_FILTER: {
        const target = action.event.target;
        const field = target.name;
        let sectionFilter = state.sectionFilterToEdit;
        sectionFilter[field] = target.type === 'checkbox' ? target.checked : target.value;
        return {...state, sectionFilterToEdit: sectionFilter, errors: null};
    }

    case NEW_SECTION_FILTER: {
        const sectionFilterToEdit = {
            is_enabled: true,
            name: '',
            description: '',
            filter_type: state.sections.active,
        };

        return {...state, sectionFilterToEdit, errors: null};
    }

    case CANCEL_EDIT: {
        return {...state, sectionFilterToEdit: null, errors: null};
    }

    case SET_ERROR:
        return {...state, errors: action.errors};

    case QUERY_SECTION_FILTERS:
        return {...state,
            isLoading: true,
            totalSectionFilters: null,
            sectionFilterToEdit: null,
            activeQuery: state.query};

    case GET_SECTION_FILTERS: {
        const sectionFiltersById = Object.assign({}, state.sectionFiltersById);
        const sectionFilters = action.data.map((sectionFilter) => {
            sectionFiltersById[sectionFilter._id] = sectionFilter;
            return sectionFilter._id;
        });

        return {
            ...state,
            sectionFilters,
            sectionFiltersById,
            isLoading: false,
            totalSectionFilters: sectionFilters.length,
        };
    }

    case INIT_SECTIONS:
    case SELECT_SECTION:
        return {...state, sections: sectionsReducer(state.sections, action)};

    case ADD_EDIT_USERS: {
        return {
            ...state,
            editUsers: [
                ...(state.editUsers || []),
                ...action.data,
            ]
        };
    }

    default: {
        const search = searchReducer(state.search, action);

        if (search !== state.search) {
            return {...state, search};
        }

        return state;
    }
    }
}
