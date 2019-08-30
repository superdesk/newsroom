
import {
    EDIT_COMPANY,
    NEW_COMPANY,
    QUERY_COMPANIES,
    SELECT_COMPANY,
    CANCEL_EDIT,
    GET_COMPANIES,
    GET_COMPANY_USERS,
    INIT_VIEW_DATA,
    SET_ERROR,
    SET_QUERY,
    GET_PRODUCTS
} from './actions';

const initialState = {
    query: null,
    companies: [],
    companiesById: {},
    activeCompanyId: null,
    isLoading: false,
    totalCompanies: null,
    activeQuery: null,
    services: [],
    sections: [],
    companyTypes: [],
    apiEnabled: false,
};

function setupCompanies(companyList, state) {
    const companiesById = {};
    const companyOptions = [];
    const companies = companyList.map((company) => {
        companiesById[company._id] = company;
        companyOptions.push({value: company._id, text: company.name});
        return company._id;
    });

    return {...state, companiesById, companyOptions, companies, isLoading: false};
}

export default function companyReducer(state = initialState, action) {
    switch (action.type) {

    case SELECT_COMPANY: {
        const defaultCompany = {
            is_enabled: true,
            _id: null,
            name: '',
            phone: '',
            sd_subscriber_id: '',
            account_manager: '',
            contact_name: '',
            country: '',
            contact_email: '',
            url: '',
        };

        return {
            ...state,
            activeCompanyId: action.id || null,
            companyToEdit: action.id ? Object.assign(defaultCompany, state.companiesById[action.id]) : null,
            errors: null,
        };
    }

    case EDIT_COMPANY: {
        const target = action.event.target;
        const field = target.name;
        let company = state.companyToEdit;
        company[field] = target.type === 'checkbox' ? target.checked : target.value;
        return {...state, companyToEdit: company, errors: null};
    }

    case NEW_COMPANY: {
        const newUser =  {
            user_type: 'public',
            is_approved: true,
            is_enabled: true,
            _id: null,
            name: '',
            email: '',
            phone: '',
            company: '',
        };

        const newCompany = {
            name: '',
            sd_subscriber_id: '',
            account_manager: '',
            phone: '',
            contact_name: '',
            country: '',
            is_enabled: true,
            contact_email: '',
            url:'',
        };

        return {...state, companyToEdit: action.data === 'users' ? newUser : newCompany, errors: null};
    }

    case CANCEL_EDIT: {
        return {...state, companyToEdit: null, errors: null};
    }

    case SET_QUERY:
        return {...state, query: action.query};

    case SET_ERROR:
        return {...state, errors: action.errors};

    case QUERY_COMPANIES:
        return {...state,
            isLoading: true,
            totalCompanies: null,
            companyToEdit: null,
            activeQuery: state.query};

    case GET_COMPANIES:
        return setupCompanies(action.data, state);

    case GET_COMPANY_USERS:
        return {...state, companyUsers: action.data};

    case GET_PRODUCTS:
        return {...state, products: action.data};

    case INIT_VIEW_DATA: {
        const nextState = {
            ...state,
            services: action.data.services,
            products: action.data.products,
            sections: action.data.sections,
            companyTypes: action.data.company_types || [],
            apiEnabled: action.data.api_enabled || false,
        };

        return setupCompanies(action.data.companies, nextState);
    }

    default:
        return state;
    }
}
