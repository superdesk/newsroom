import React from 'react';
import PropTypes from 'prop-types';
import {get, isEmpty} from 'lodash';

import TextListInput from 'components/TextListInput';
import TextInput from 'components/TextInput';
import TextAreaInput from 'components/TextAreaInput';
import SelectInput from 'components/SelectInput';
import CheckboxInput from 'components/CheckboxInput';
import EditPanel from '../../components/EditPanel';
import AuditInformation from 'components/AuditInformation';

import MonitoringSchedule from './MonitoringSchedule';

import { gettext } from 'utils';

const getCompanyOptions = (companies) => companies.map(company => ({value: company._id, text: company.name}));

class EditMonitoringProfile extends React.Component {
    constructor(props) {
        super(props);
        this.handleTabClick = this.handleTabClick.bind(this);
        this.getUsers = this.getUsers.bind(this);
        this.state = {activeTab: this.props.scheduleMode ? 'schedule' : 'profile'};
        this.tabs = [
            {label: gettext('Profile'), name: 'profile'},
            {label: gettext('Users'), name: 'users'},
            {label: gettext('Schedule'), name: 'schedule'},
        ];
    }

    handleTabClick(event) {
        this.setState({activeTab: event.target.name});
        if (event.target.name === 'users' && get(this.props, 'item.company')) {
            this.props.fetchCompanyUsers(this.props.item.company);
        }
    }

    getUsers() {
        if (isEmpty(this.props.users)) {
            return (
                <tr>
                    <td colSpan="2">{gettext('There are no users for this monitoring profile.')}</td>
                </tr>
            );
        }

        return this.props.users.map((user) => (
            <tr key={user._id}>
                <td>{user.first_name} {user.last_name}</td>
            </tr>
        ));
    }

    componentDidUpdate(prevProps) {
        if (this.props.item._id !== prevProps.item._id) {
            this.setState({activeTab: this.props.scheduleMode ? 'schedule' : 'profile'});
            return;
        }

        if (this.props.scheduleMode && prevProps.scheduleMode !== this.props.scheduleMode) {
            this.setState({activeTab: 'schedule'});
            return;
        }

        if (!this.props.scheduleMode && prevProps.scheduleMode !== this.props.scheduleMode) {
            this.setState({activeTab: 'profile'});
            return;
        }
    }


    render() {
        const {item, onChange, errors, companies, onSave, onClose, onDelete} = this.props;
        const getError = (field) => errors ? errors[field] : null;

        return (
            <div className='list-item__preview'>
                <div className='list-item__preview-header'>
                    <h3>{ gettext('Add/Edit Monitoring Profile') }</h3>
                    <button
                        id='hide-sidebar'
                        type='button'
                        className='icon-button'
                        data-dismiss='modal'
                        aria-label='Close'
                        onClick={onClose}>
                        <i className="icon--close-thin icon--gray" aria-hidden='true'></i>
                    </button>
                </div>
                <AuditInformation item={item} />
                <ul className='nav nav-tabs'>
                    {this.tabs.filter((tab, index) => index === 0 || this.props.item._id).map((tab) => (
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
                    {this.state.activeTab === 'profile' &&
                        <div className='tab-pane active' id='profile'>
                            <form>
                                <div className="list-item__preview-form">
                                    <TextInput
                                        name='name'
                                        label={gettext('Name')}
                                        value={item.name}
                                        onChange={onChange}
                                        error={getError('name')} />

                                    <TextInput
                                        name='subject'
                                        label={gettext('Subject line')}
                                        value={item.subject}
                                        onChange={onChange}
                                        error={getError('subject')} />

                                    <CheckboxInput
                                        name='headline_subject'
                                        label={gettext('Use Headline as Subject of emails containing a single item')}
                                        value={item.headline_subject}
                                        onChange={onChange}/>

                                    <TextInput
                                        name='description'
                                        label={gettext('Description')}
                                        value={item.description}
                                        onChange={onChange}
                                        error={getError('description')} />

                                    <SelectInput
                                        name='company'
                                        label={gettext('Company')}
                                        value={item.company}
                                        defaultOption={''}
                                        options={getCompanyOptions(companies)}
                                        onChange={onChange}
                                        error={getError('company')} />

                                    <TextInput
                                        name='email'
                                        label={gettext('Email Address')}
                                        value={item.email || ''}
                                        onChange={onChange}
                                        error={getError('email')}
                                        description={gettext('Optional comma seperated list of email addresses')}
                                    />

                                    <TextAreaInput
                                        name='query'
                                        label={gettext('Query')}
                                        value={item.query}
                                        onChange={onChange}
                                        error={getError('query')}>
                                        {item.query &&
                                                <a target="_blank" href={`/${'wire'}?q=${item.query}`}
                                                    className='btn btn-outline-secondary float-right mt-3'>{gettext('Test Monitoring Profile query')}
                                                </a>}
                                    </TextAreaInput>

                                    <TextListInput
                                        label={gettext('Keywords')}
                                        name='keywords'
                                        value={item.keywords || []}
                                        onChange={onChange} />


                                    <SelectInput
                                        name='alert_type'
                                        label={gettext('Alert type')}
                                        value={item.alert_type || 'full_text'}
                                        options={[
                                            {value: 'linked_text', text: 'Linked extract(s)'},
                                            {value: 'full_text', text: 'Full text'}
                                        ]}
                                        onChange={onChange}
                                        error={getError('alert_type')} />

                                    <SelectInput
                                        name='format_type'
                                        label={gettext('Format type')}
                                        value={item.format_type || 'monitoring_pdf'}
                                        options={[
                                            {value: 'monitoring_pdf', text: 'PDF'},
                                            {value: 'monitoring_rtf', text: 'RTF'},
                                            {value: 'monitoring_email', text: 'Email'}
                                        ]}
                                        onChange={onChange}
                                        error={getError('format_type')} />

                                    <CheckboxInput
                                        name='is_enabled'
                                        label={gettext('Enabled')}
                                        value={item.is_enabled}
                                        onChange={onChange} />

                                    {get(item, 'schedule.interval') && item.schedule.interval !== 'immediate' &&
                                        <CheckboxInput
                                            name='always_send'
                                            label={gettext('Always Send')}
                                            value={item.always_send}
                                            onChange={onChange} />}
                                </div>

                                <div className='list-item__preview-footer'>
                                    <input
                                        type='button'
                                        className='btn btn-outline-primary'
                                        value={gettext('Save')}
                                        onClick={onSave} />

                                    {item._id && <input
                                        type='button'
                                        className='btn btn-outline-primary'
                                        value={gettext('Delete')}
                                        onClick={onDelete} />}
                                </div>
                            </form>
                        </div>
                    }
                    {this.state.activeTab === 'users' &&
                        <EditPanel
                            parent={this.props.item}
                            items={this.props.users.map((u) => ({
                                ...u,
                                name: `${u.first_name} ${u.last_name}`
                            }))}
                            field="users"
                            onSave={this.props.saveMonitoringProfileUsers}
                        />
                    }
                    {this.state.activeTab === 'schedule' &&
                        <MonitoringSchedule
                            item={item}
                            onsaveMonitoringProfileSchedule={this.props.saveMonitoringProfileSchedule}
                            onChange={onChange}
                        />
                    }
                </div>
            </div>
        );
    }
}

EditMonitoringProfile.propTypes = {
    item: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    errors: PropTypes.object,
    companies: PropTypes.arrayOf(PropTypes.object),
    onSave: PropTypes.func.isRequired,
    fetchCompanyUsers: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    scheduleMode: PropTypes.bool,
    users: PropTypes.arrayOf(PropTypes.object),
    saveMonitoringProfileUsers: PropTypes.func,
    saveMonitoringProfileSchedule: PropTypes.func,
};

export default EditMonitoringProfile;
