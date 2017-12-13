import React from 'react';
import PropTypes from 'prop-types';
import TextInput from 'components/TextInput';
import CheckboxInput from 'components/CheckboxInput';

import { gettext } from 'utils';
import EditPanel from '../../components/EditPanel';


class EditProduct extends React.Component {
    constructor(props) {
        super(props);
        this.handleTabClick = this.handleTabClick.bind(this);
        this.state = {
            activeTab: 'product-details',
            activeProduct: props.product._id,
        };

        this.tabs = [
            {label: gettext('Product'), name: 'product-details'},
            {label: gettext('Companies'), name: 'companies'},
            {label: gettext('Navigations'), name: 'navigations'}
        ];
    }

    handleTabClick(event) {
        this.setState({activeTab: event.target.name});
        if(event.target.name === 'companies') {
            this.props.fetchCompanies();
        }
        if(event.target.name === 'navigations') {
            this.props.fetchNavigations();
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
                        className='icon-button'
                        data-dismiss='modal'
                        aria-label='Close'
                        onClick={this.props.onClose}>
                        <i className="icon--close-thin icon--gray" aria-hidden='true'></i>
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

                                    <TextInput
                                        name='sd_product_id'
                                        label={gettext('Superdesk Product Id')}
                                        value={this.props.product.sd_product_id || ''}
                                        onChange={this.props.onChange}
                                        error={this.props.errors ? this.props.errors.sd_product_id : null}/>

                                    <TextInput
                                        name='query'
                                        label={gettext('Query')}
                                        value={this.props.product.query || ''}
                                        onChange={this.props.onChange}
                                        error={this.props.errors ? this.props.errors.query : null}/>

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
                        <EditPanel
                            parent={this.props.product}
                            items={this.props.companies}
                            field="companies"
                            onSave={this.props.saveCompanies}
                        />
                    }
                    {this.state.activeTab === 'navigations' &&
                        <EditPanel
                            parent={this.props.product}
                            items={this.props.navigations}
                            field="navigations"
                            onSave={this.props.saveNavigations}
                        />
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
    navigations: PropTypes.arrayOf(PropTypes.object),
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    saveCompanies: PropTypes.func.isRequired,
    saveNavigations: PropTypes.func.isRequired,
    fetchCompanies: PropTypes.func.isRequired,
    fetchNavigations: PropTypes.func.isRequired,
};

export default EditProduct;