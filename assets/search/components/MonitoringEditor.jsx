import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {get, set, cloneDeep, isEqual} from 'lodash';
import {gettext} from 'utils';
import EditPanel from 'components/EditPanel';
import TextInput from 'components/TextInput';
import CheckboxInput from 'components/CheckboxInput';
import SelectInput from 'components/SelectInput';
import MonitoringSchedule from '../../monitoring/components/MonitoringSchedule';

import {fetchCompanyUsers} from 'companies/actions';
import {postMonitoringProfile} from 'monitoring/actions';

class MonitoringEditor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            profile: null,
            saving: false,
            dirty: false,
            activeTab: 'profile',
        };

        this.tabs = [
            {label: gettext('Monitoring Profile'), name: 'profile'}
        ];

        if (this.props.isAdmin) {
            this.tabs.push({label: gettext('Users'), name: 'users'});
        }

        this.handleTabClick = this.handleTabClick.bind(this);
        this.onChange = this.onChange.bind(this);
        this.saveMonitoringProfile = this.saveMonitoringProfile.bind(this);
    }

    handleTabClick(event) {
        this.setState({activeTab: event.target.name});
        if (event.target.name === 'users' && get(this.props, 'item.company')) {
            this.props.fetchCompanyUsers(this.props.item.company);
        }
    }

    componentDidMount() {
        if (this.props.item != null) {
            this.changeMonitoringProfile(this.props.item);
        }
    }

    componentDidUpdate(prevProps) {
        if (get(prevProps, 'item._id') !== get(this.props, 'item._id') ||
            get(prevProps, 'item._updated') !== get(this.props, 'item._updated')) {
            this.changeMonitoringProfile(this.props.item);
        }
    }

    changeMonitoringProfile(item) {
        this.setState({
            profile: cloneDeep(item),
            saving: false,
            dirty: false,
        });
    }

    onChange(event) {
        let wl = cloneDeep(this.state.profile);
        let field = event.target.name;
        let value = event.target.value;
        let autoSave, msg;

        if (field === 'notifications') {
            field = 'users';
            value = get(this.state, 'profile.users') || [];
            if (value.includes(this.props.user)) {
                value = value.filter((u) => u !== this.props.user);
                msg = gettext('Unsubscribed');
            } else {
                value.push(this.props.user);
                msg = gettext('Subscribed');
            }
            autoSave = true;
        } else if (field === 'is_enabled') {
            value = !get(this.state, 'profile.is_enabled');
        }
        
        set(wl, field, value);

        this.setState({
            profile: wl,
            dirty: !isEqual((get(this.props, 'item') || {}), wl),
        });

        if (autoSave && msg) {
            this.props.saveMonitoringProfile(wl, gettext('{{ msg }} successfully', {msg: msg}));
        }
    }

    saveMonitoringProfile(event) {
        if (event && 'preventDefault' in event) {
            event.preventDefault();
        }

        this.props.saveMonitoringProfile(this.state.profile);
    }

    render() {
        const {item, isAdmin, user} = this.props;
        const profile = get(this.state, 'profile');
        if (!profile) {
            return null;
        }
        
        const propsToFields = {
            'onChange': this.onChange,
            'readOnly': !isAdmin,
        };
        const subscribed = (get(this.state, 'profile.users') || []).includes(user);

        return (
            <div className='list-item__preview'>
                <div className="list-item__preview-header">
                    <h3>{get(item, 'name')}</h3>
                    <button
                        id="hide-sidebar"
                        type="button"
                        className="icon-button"
                        onClick={this.props.closeEditor}
                        disabled={this.state.saving}
                    >
                        <i className="icon--close-thin icon--gray" />
                    </button>
                </div>
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
                <div className="list-item__preview-form">
                    <div className='tab-content'>
                        {this.state.activeTab === 'profile' &&
                        <div className='tab-pane active' id='profile'>
                            <form>
                                <div className="list-item__preview-form">
                                    {!isAdmin && (
                                        <div className='form-group'>
                                            <input
                                                name='notifications'
                                                type="button"
                                                className="btn btn-outline-primary"
                                                value={subscribed ? gettext('Unsubscribe') : gettext('Subscribe')}
                                                onClick={this.onChange}
                                                disabled={this.state.saving} />
                                        </div>
                                    )}
                                    <TextInput
                                        name='subject'
                                        label={gettext('Subject line')}
                                        value={profile.subject}
                                        {...propsToFields} />

                                    <TextInput
                                        name='description'
                                        label={gettext('Description')}
                                        value={profile.description}
                                        {...propsToFields} /> 

                                    <SelectInput
                                        name='alert_type'
                                        label={gettext('Alert type')}
                                        value={profile.alert_type}
                                        options={[
                                            {value: 'linked_text', text: 'Linked extract(s)'},
                                            {value: 'full_text', text: 'Full text'}
                                        ]}
                                        {...propsToFields} />

                                    <MonitoringSchedule 
                                        item={profile}
                                        onsaveMonitoringProfileSchedule={this.onChange}
                                        {...propsToFields}
                                        noForm />

                                    <CheckboxInput
                                        name='is_enabled'
                                        label={gettext('Enabled')}
                                        value={profile.is_enabled}
                                        {...propsToFields} />
                                </div>
                                {isAdmin && (<div className="list-item__preview-footer">
                                    <input
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        value={gettext('Cancel')}
                                        onClick={this.props.closeEditor}
                                        disabled={this.state.saving}
                                    />
                                    <input
                                        type="button"
                                        className="btn btn-outline-primary"
                                        value={gettext('Save')}
                                        onClick={this.saveprofile}
                                        disabled={this.state.saving || !this.state.dirty}
                                    />
                                </div>)}
                            </form>
                        </div>}
                        {this.state.activeTab === 'users' &&
                            <EditPanel
                                parent={profile}
                                items={this.props.monitoringProfileUsers.map((u) => ({
                                    ...u,
                                    name: `${u.first_name} ${u.last_name}`
                                }))}
                                field="users"
                                onChange={this.onChange}
                                onSave={this.saveMonitoringProfile}
                                onCancel={this.props.closeEditor}
                                saveDisabled={this.state.saving || isEqual(get(this.props, 'item.users'),
                                    get(this.state, 'profile.users')) }
                                cancelDisabled={this.state.saving}
                            />
                        }
                    </div>
                </div>
            </div>
        );
    }
}

MonitoringEditor.propTypes = {
    closeEditor: PropTypes.func,
    onTopicChanged: PropTypes.func,
    hideModal: PropTypes.func,
    loadMyTopic: PropTypes.func,
    isAdmin: PropTypes.bool,
    fetchCompanyUsers: PropTypes.func,
    item: PropTypes.object,
    user: PropTypes.string,
    saveMonitoringProfile: PropTypes.func,
    monitoringProfileUsers: PropTypes.array,
};

const mapStateToProps = (state) => ({
    monitoringProfileUsers: state.monitoringProfileUsers || [],
    user: get(state, 'editedUser._id'),
});

const mapDispatchToProps = (dispatch) => ({
    saveMonitoringProfile: (item, notifyMsg) => dispatch(postMonitoringProfile(item, notifyMsg)),
    fetchCompanyUsers: (companyId) => dispatch(fetchCompanyUsers(companyId, true)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MonitoringEditor);
