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
        this.getUsers = this.getUsers.bind(this);
        this.state = {activeTab: 'company-details'};
    }

    handleTabClick(event) {
        this.setState({activeTab: event.target.name});
        if(event.target.name === 'users') {
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

    render() {
        return (
            <div className='col'>
                <div className='modal-header'>
                    <h3>{this.props.company.name}</h3>
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
                    <li className='nav-item'>
                        <a 
                            name='company-details' 
                            className={`nav-link ${this.state.activeTab !== 'users'?'active':'null'}`} 
                            href='#' 
                            onClick={this.handleTabClick}>Company
                        </a>
                    </li>
                    <li className='nav-item'>
                        <a 
                            name='users'
                            className={`nav-link ${this.state.activeTab === 'users'?'active':'null'}`}
                            href='#'
                            onClick={this.handleTabClick}>Users</a>
                    </li>
                </ul>

                <div className='tab-content mt-3'>
                    {this.state.activeTab === 'company-details' ?
                        <div className='tab-pane active' id='company-details'>
                            <form>
                                <TextInput
                                    name='name'
                                    label={gettext('Name')}
                                    value={this.props.company.name}
                                    onChange={this.props.onChange}
                                    error={this.props.errors ? this.props.errors.name : null}/>

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

                                <SelectInput
                                    name='country'
                                    label={gettext('Country')}
                                    value={this.props.company.country}
                                    defaultOption=''
                                    options={countries}
                                    onChange={this.props.onChange}
                                    error={this.props.errors ? this.props.errors.user_type : null}/>

                                <CheckboxInput
                                    name='is_enabled'
                                    label={gettext('Enabled')}
                                    value={this.props.company.is_enabled}
                                    onChange={this.props.onChange}/>


                                <div className='modal-footer'>
                                    <input
                                        type='button'
                                        className='btn btn-primary'
                                        value={gettext('Save')}
                                        onClick={this.props.onSave}/>
                                    <input
                                        type='button'
                                        className='btn btn-primary'
                                        value={gettext('Delete')}
                                        onClick={this.props.onDelete}/>
                                </div>


                            </form>
                        </div> : <div className='tab-pane active' id='users'>
                            <table className='table table-responsive table-hover'>
                                <tbody>{this.getUsers()}</tbody>
                            </table>
                        </div>}
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
};

export default EditCompany;
