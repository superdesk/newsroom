import React from 'react';
import PropTypes from 'prop-types';
import TextInput from 'components/TextInput';
import SelectInput from 'components/SelectInput';
import CheckboxInput from 'components/CheckboxInput';

import { gettext, shortDate } from 'utils';

const countries = [
    {value: 'au', text: gettext('Australia')},
    {value: 'nz', text: gettext('New Zealand')},
    {value: 'other', text: gettext('Other')},
];

class EditCompany extends React.Component {
    constructor(props) {
        super(props);
        this.handleTabClick = this.handleTabClick.bind(this);
        this.getCompanyProducts = this.getCompanyProducts.bind(this);
        this.getUsers = this.getUsers.bind(this);
        this.state = {activeTab: 'company-details'};
        this.tabs = [
            {label: gettext('Company'), name: 'company-details'},
            {label: gettext('Users'), name: 'users'},
            {label: gettext('Subscription'), name: 'subscription'},
        ];
    }

    handleTabClick(event) {
        this.setState({activeTab: event.target.name});
        if(event.target.name === 'users' && this.props.company._id) {
            this.props.fetchCompanyUsers(this.props.company._id);
        }
    }

    getUsers() {
        if (this.props.users) {
            return this.props.users.map((user) => (<tr key={user._id}>
                <td>{user.first_name} {user.last_name}</td>
                <td>{shortDate(user._created)}</td>
            </tr>));
        }
    }

    getCompanyProducts() {
        return this.props.products.filter((product) => product.companies.includes(this.props.company._id));
    }

    render() {
        return (
            <div className='list-item__preview'>
                <div className='list-item__preview-header'>
                    <h3>{this.props.company.name}</h3>
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
                    {this.state.activeTab === 'company-details' &&
                        <div className='tab-pane active' id='company-details'>
                            <form>
                                <div className="list-item__preview-form">
                                    <TextInput
                                        name='name'
                                        label={gettext('Name')}
                                        value={this.props.company.name}
                                        onChange={this.props.onChange}
                                        error={this.props.errors ? this.props.errors.name : null}/>

                                    <TextInput
                                        name='url'
                                        label={gettext('Company Url')}
                                        value={this.props.company.url}
                                        onChange={this.props.onChange}
                                        error={this.props.errors ? this.props.errors.url : null}/>

                                    <TextInput
                                        name='sd_subscriber_id'
                                        label={gettext('Superdesk Subscriber Id')}
                                        value={this.props.company.sd_subscriber_id}
                                        onChange={this.props.onChange}
                                        error={this.props.errors ? this.props.errors.sd_subscriber_id : null}/>

                                    <TextInput
                                        name='phone'
                                        label={gettext('Telephone')}
                                        value={this.props.company.phone}
                                        onChange={this.props.onChange}
                                        error={this.props.errors ? this.props.errors.phone : null}/>

                                    <TextInput
                                        name='contact_name'
                                        label={gettext('Contact Name')}
                                        value={this.props.company.contact_name}
                                        onChange={this.props.onChange}
                                        error={this.props.errors ? this.props.errors.contact_name : null}/>

                                    <TextInput
                                        name='contact_email'
                                        label={gettext('Contact Email')}
                                        value={this.props.company.contact_email}
                                        onChange={this.props.onChange}
                                        error={this.props.errors ? this.props.errors.contact_email : null}/>
                                    <SelectInput
                                        name='country'
                                        label={gettext('Country')}
                                        value={this.props.company.country}
                                        options={countries}
                                        onChange={this.props.onChange}
                                        error={this.props.errors ? this.props.errors.user_type : null}/>

                                    <CheckboxInput
                                        name='is_enabled'
                                        label={gettext('Enabled')}
                                        value={this.props.company.is_enabled}
                                        onChange={this.props.onChange}/>

                                </div>
                                <div className='list-item__preview-footer'>
                                    <input
                                        type='button'
                                        className='btn btn-outline-primary'
                                        value={gettext('Save')}
                                        onClick={this.props.onSave}/>
                                    {this.props.company._id && <input
                                        type='button'
                                        className='btn btn-outline-secondary'
                                        value={gettext('Delete')}
                                        onClick={this.props.onDelete}/>}
                                </div>
                            </form>
                        </div>
                    }
                    {this.state.activeTab === 'users' &&
                        <div className='tab-pane active' id='users'>
                            <table className='table'>
                                <tbody>{this.getUsers()}</tbody>
                            </table>
                        </div>
                    }
                    {this.state.activeTab === 'subscription' &&
                        <div className='tab-pane active' id='subscription'>
                            <table className='table'>
                                <tbody>
                                    {this.getCompanyProducts().map((product) => (
                                        <tr key={product._id}>
                                            <td>{product.name}</td>
                                            <td>{product.description}</td>
                                        </tr>))}
                                </tbody>
                            </table>
                        </div>
                    }
                </div>
            </div>
        );
    }
}

EditCompany.propTypes = {
    company: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    errors: PropTypes.object,
    users: PropTypes.arrayOf(PropTypes.object),
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    fetchCompanyUsers: PropTypes.func.isRequired,
    products: PropTypes.array.isRequired,
};

export default EditCompany;
