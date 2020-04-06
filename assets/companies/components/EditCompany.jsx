import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import TextInput from 'components/TextInput';
import SelectInput from 'components/SelectInput';
import CheckboxInput from 'components/CheckboxInput';
import DateInput from 'components/DateInput';

import { isEmpty, get, sortBy } from 'lodash';
import { gettext, shortDate, getDateInputDate, isInPast } from 'utils';
import CompanyPermissions from './CompanyPermissions';
import EditCompanyAPI from './EditCompanyAPI';
import AuditInformation from 'components/AuditInformation';
import { countries } from '../utils';

class EditCompany extends React.Component {
    constructor(props) {
        super(props);
        this.handleTabClick = this.handleTabClick.bind(this);
        this.getUsers = this.getUsers.bind(this);
        this.state = {activeTab: 'company-details'};
        this.tabs = [
            {label: gettext('Company'), name: 'company-details'},
            {label: gettext('Users'), name: 'users'},
            {label: gettext('Permissions'), name: 'permissions'},
        ];

        if (this.props.apiEnabled) {
            this.tabs.push({label: gettext('API'), name: 'api'});
        }
    }

    handleTabClick(event) {
        this.setState({activeTab: event.target.name});
        if (event.target.name === 'users' && this.props.company._id) {
            this.props.fetchCompanyUsers(this.props.company._id);
        }
    }

    getUsers() {
        if (isEmpty(this.props.users)) {
            return (
                <tr>
                    <td colSpan="2">{gettext('There are no users in the company.')}</td>
                </tr>
            );
        }

        return this.props.users.map((user) => (
            <tr key={user._id}>
                <td>{user.first_name} {user.last_name}</td>
                <td>{shortDate(user._created)}</td>
            </tr>
        ));
    }

    componentDidUpdate(prevProps) {
        // reset tabs when new company is created
        if (!this.props.company._id && prevProps.company._id) {
            this.setState({activeTab: 'company-details'});
        }
    }

    render() {
        return (
            <div className={classNames(
                'list-item__preview',
                {'list-item__preview--large': this.props.apiEnabled}
            )}>
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
                <AuditInformation item={this.props.company} />
                <ul className='nav nav-tabs'>
                    {this.tabs.filter((tab, index) => index === 0 || this.props.company._id).map((tab) => (
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

                                    <SelectInput
                                        name='company_type'
                                        label={gettext('Company Type')}
                                        value={this.props.company.company_type}
                                        options={this.props.companyTypes.map((ctype) => ({text: gettext(ctype.name), value: ctype.id}))}
                                        defaultOption=""
                                        onChange={this.props.onChange}
                                        error={this.props.errors ? this.props.errors.company_type : null}/>

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
                                        name='account_manager'
                                        label={gettext('Account Manager')}
                                        value={this.props.company.account_manager}
                                        onChange={this.props.onChange}
                                        error={this.props.errors ? this.props.errors.account_manager : null}/>

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
                                        error={this.props.errors ? this.props.errors.country : null}/>

                                    <DateInput
                                        name={'expiry_date'}
                                        label={gettext('Expiry Date')}
                                        value={getDateInputDate(this.props.company.expiry_date)}
                                        onChange={this.props.onChange}
                                        error={this.props.errors ? this.props.errors.expiry_date : null}/>

                                    {get(this.props, 'company.sections.monitoring') && <SelectInput
                                        name='monitoring_administrator'
                                        label={gettext('Monitoring Administrator')}
                                        value={this.props.company.monitoring_administrator}
                                        options={sortBy(this.props.users || [], 'first_name').map((u) => ({
                                            text: `${u.first_name} ${u.last_name}`,
                                            value: u._id}))}
                                        defaultOption=""
                                        onChange={this.props.onChange}/>}

                                    <CheckboxInput
                                        labelClass={isInPast(this.props.company.expiry_date) ? 'text-danger' : ''}
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
                    {this.state.activeTab === 'permissions' && this.props.company._id &&
                        <CompanyPermissions
                            company={this.props.company}
                        />
                    }
                    {this.props.apiEnabled && this.state.activeTab === 'api' && this.props.company._id && (
                        <EditCompanyAPI
                            company={this.props.company}
                            onEditCompany={this.props.onChange}
                            onSave={this.props.onSave}
                            errors={this.props.errors}
                            originalItem={this.props.originalItem}
                        />
                    )}
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
    companyTypes: PropTypes.array,
    apiEnabled: PropTypes.bool,
    originalItem: PropTypes.object,
};

export default EditCompany;
