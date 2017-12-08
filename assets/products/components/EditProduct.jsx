import React from 'react';
import PropTypes from 'prop-types';
import TextInput from 'components/TextInput';
import SelectInput from 'components/SelectInput';
import CheckboxInput from 'components/CheckboxInput';
import { pickBy } from 'lodash';

import { gettext } from 'utils';

const productTypes = [
    {value: 'query', text: gettext('Query')},
    {value: 'superdesk', text: gettext('Superdesk')},
    {value: 'curated', text: gettext('Curated')},
];

class EditProduct extends React.Component {
    constructor(props) {
        super(props);
        this.handleTabClick = this.handleTabClick.bind(this);
        this.onCompanyChange = this.onCompanyChange.bind(this);
        this.saveCompanies = this.saveCompanies.bind(this);
        this.state = {activeTab: 'product-details', activeProduct: props.product._id, companies: {}};
        this.updateCompanies = this.updateCompanies.bind(this);

        this.tabs = [
            {label: gettext('Product'), name: 'product-details'},
            {label: gettext('Companies'), name: 'companies'}
        ];
    }

    handleTabClick(event) {
        this.setState({activeTab: event.target.name});
        if(event.target.name === 'companies') {
            this.props.fetchCompanies();
        }
    }

    updateCompanies(props) {
        const companies = {};
        props.companies.map((company) =>
            companies[company._id] = (props.product.companies || []).includes(company._id));

        this.setState({activeProduct: props.product._id, companies});
    }

    onCompanyChange(event) {
        const company = event.target.name;
        const companies = Object.assign({}, this.state.companies);
        companies[company] = !companies[company];
        this.setState({companies});
    }

    saveCompanies(event) {
        event.preventDefault();
        this.props.saveCompanies(Object.keys(pickBy(this.state.companies)));
    }

    componentWillMount() {
        this.updateCompanies(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.activeProduct !== nextProps.product._id) {
            this.updateCompanies(nextProps);
        }
    }

    render() {
        return (
            <div className='list-item__preview'>
                <div className='list-item__preview-header'>
                    <h3>{this.props.product.name}</h3>
                    <button
                        id='hide-sidebar'
                        type='button'
                        className='close'
                        data-dismiss='modal'
                        aria-label='Close'
                        onClick={this.props.onClose}>
                        <span aria-hidden='true'>&times;</span>
                    </button>
                </div>

                <ul className='nav nav-tabs'>
                    {this.tabs.map((tab) => (
                        <li key={tab.name} className='nav-item'>
                            <a
                                name={tab.name}
                                className={`nav-link ${this.state.activeTab === tab.name && 'active'}`}
                                href='#'
                                onClick={this.handleTabClick}>{tab.label}
                            </a>
                        </li>
                    ))}
                </ul>

                <div className='tab-content'>
                    {this.state.activeTab === 'product-details' &&
                        <div className='tab-pane active' id='product-details'>
                            <form>
                                <div className="list-item__preview-form">
                                    <TextInput
                                        name='name'
                                        label={gettext('Name')}
                                        value={this.props.product.name}
                                        onChange={this.props.onChange}
                                        error={this.props.errors ? this.props.errors.name : null}/>

                                    <TextInput
                                        name='description'
                                        label={gettext('Description')}
                                        value={this.props.product.description}
                                        onChange={this.props.onChange}
                                        error={this.props.errors ? this.props.errors.description : null}/>

                                    { this.props.product.product_type === 'superdesk' && <TextInput
                                        name='sd_product_id'
                                        label={gettext('Superdesk Product Id')}
                                        value={this.props.product.sd_product_id || ''}
                                        onChange={this.props.onChange}
                                        error={this.props.errors ? this.props.errors.sd_product_id : null}/> }

                                    { this.props.product.product_type === 'query' && <TextInput
                                        name='query'
                                        label={gettext('Query')}
                                        value={this.props.product.query || ''}
                                        onChange={this.props.onChange}
                                        error={this.props.errors ? this.props.errors.query : null}/> }

                                    <SelectInput
                                        name='product_type'
                                        label={gettext('Product Type')}
                                        value={this.props.product.product_type}
                                        options={productTypes}
                                        onChange={this.props.onChange}
                                        error={this.props.errors ? this.props.errors.product_type : null}/>

                                    <CheckboxInput
                                        name='is_enabled'
                                        label={gettext('Enabled')}
                                        value={this.props.product.is_enabled}
                                        onChange={this.props.onChange}/>

                                </div>
                                <div className='list-item__preview-footer'>
                                    <input
                                        type='button'
                                        className='btn btn-outline-primary'
                                        value={gettext('Save')}
                                        onClick={this.props.onSave}/>
                                    <input
                                        type='button'
                                        className='btn btn-outline-secondary'
                                        value={gettext('Delete')}
                                        onClick={this.props.onDelete}/>
                                </div>
                            </form>
                        </div>
                    }
                    {this.state.activeTab === 'companies' &&
                        <div className='tab-pane active' id='companies'>
                            <form onSubmit={this.saveCompanies}>
                                <div className="list-item__preview-form">
                                    <ul className="list-unstyled">
                                        {this.props.companies.map((company) => (
                                            <li key={company._id}>
                                                <CheckboxInput
                                                    name={company._id}
                                                    label={company.name}
                                                    value={!!this.state.companies[company._id]  }
                                                    onChange={this.onCompanyChange} />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className='list-item__preview-footer'>
                                    <input
                                        type='submit'
                                        className='btn btn-outline-primary'
                                        value={gettext('Save')}
                                    />
                                </div>
                            </form>
                        </div>
                    }
                </div>
            </div>
        );
    }
}

EditProduct.propTypes = {
    product: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    errors: PropTypes.object,
    companies: PropTypes.arrayOf(PropTypes.object),
    productCompanies: PropTypes.object,
    navigations: PropTypes.arrayOf(PropTypes.object),
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    saveCompanies: PropTypes.func.isRequired,
    fetchCompanies: PropTypes.func.isRequired,
};

export default EditProduct;