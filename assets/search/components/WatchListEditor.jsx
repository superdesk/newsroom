import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {get, set, cloneDeep, isEqual} from 'lodash';
import {gettext} from 'utils';
import EditPanel from 'components/EditPanel';
import TextInput from 'components/TextInput';
import CheckboxInput from 'components/CheckboxInput';
import SelectInput from 'components/SelectInput';
import WatchListSchedule from '../../watch-lists/components/WatchListSchedule';

import {fetchCompanyUsers} from 'companies/actions';
import {postWatchList} from 'watch-lists/actions';

class WatchListEditor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            watchList: null,
            saving: false,
            dirty: false,
            activeTab: 'watch-list',
        };

        this.tabs = [
            {label: gettext('Watch List'), name: 'watch-list'}
        ];

        if (this.props.isAdmin) {
            this.tabs.push({label: gettext('Users'), name: 'users'});
        }

        this.handleTabClick = this.handleTabClick.bind(this);
        this.onChange = this.onChange.bind(this);
        this.saveWatchList = this.saveWatchList.bind(this);
    }

    handleTabClick(event) {
        this.setState({activeTab: event.target.name});
        if (event.target.name === 'users' && get(this.props, 'item.company')) {
            this.props.fetchCompanyUsers(this.props.item.company);
        }
    }

    componentDidMount() {
        if (this.props.item != null) {
            this.changeWatchList(this.props.item);
        }
    }

    componentDidUpdate(prevProps) {
        if (get(prevProps, 'item._id') !== get(this.props, 'item._id') ||
            get(prevProps, 'item._updated') !== get(this.props, 'item._updated')) {
            this.changeWatchList(this.props.item);
        }
    }

    changeWatchList(item) {
        this.setState({
            watchList: cloneDeep(item),
            saving: false,
            dirty: false,
        });
    }

    onChange(event) {
        let wl = cloneDeep(this.state.watchList);
        let field = event.target.name;
        let value = event.target.value;
        let autoSave, msg;

        if (field === 'notifications') {
            field = 'users';
            value = get(this.state, 'watchList.users') || [];
            if (value.includes(this.props.user)) {
                value = value.filter((u) => u !== this.props.user);
                msg = gettext('Unsubscribed');
            } else {
                value.push(this.props.user);
                msg = gettext('Subscribed');
            }
            autoSave = true;
        } else if (field === 'is_enabled') {
            value = !get(this.state, 'watchList.is_enabled');
        }
        
        set(wl, field, value);

        this.setState({
            watchList: wl,
            dirty: !isEqual((get(this.props, 'item') || {}), wl),
        });

        if (autoSave && msg) {
            this.props.saveWatchList(wl, gettext('{{ msg }} successfully', {msg: msg}));
        }
    }

    saveWatchList(event) {
        if (event && 'preventDefault' in event) {
            event.preventDefault();
        }

        this.props.saveWatchList(this.state.watchList);
    }

    render() {
        const {item, isAdmin, user} = this.props;
        const watchList = get(this.state, 'watchList');
        if (!watchList) {
            return null;
        }
        
        const propsToFields = {
            'onChange': this.onChange,
            'readOnly': !isAdmin,
        };
        const subscribed = (get(this.state, 'watchList.users') || []).includes(user);

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
                        {this.state.activeTab === 'watch-list' &&
                        <div className='tab-pane active' id='watch-list'>
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
                                        value={watchList.subject}
                                        {...propsToFields} />

                                    <TextInput
                                        name='description'
                                        label={gettext('Description')}
                                        value={watchList.description}
                                        {...propsToFields} /> 

                                    <SelectInput
                                        name='alert_type'
                                        label={gettext('Alert type')}
                                        value={watchList.alert_type}
                                        options={[
                                            {value: 'linked_text', text: 'Linked extract(s)'},
                                            {value: 'full_text', text: 'Full text'}
                                        ]}
                                        {...propsToFields} />

                                    <WatchListSchedule 
                                        watchList={watchList}
                                        onsaveWatchListSchedule={this.onChange}
                                        {...propsToFields}
                                        noForm />

                                    <CheckboxInput
                                        name='is_enabled'
                                        label={gettext('Enabled')}
                                        value={watchList.is_enabled}
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
                                        onClick={this.saveWatchList}
                                        disabled={this.state.saving || !this.state.dirty}
                                    />
                                </div>)}
                            </form>
                        </div>}
                        {this.state.activeTab === 'users' &&
                            <EditPanel
                                parent={watchList}
                                items={this.props.watchListUsers.map((u) => ({
                                    ...u,
                                    name: `${u.first_name} ${u.last_name}`
                                }))}
                                field="users"
                                onChange={this.onChange}
                                onSave={this.saveWatchList}
                                onCancel={this.props.closeEditor}
                                saveDisabled={this.state.saving || isEqual(get(this.props, 'item.users'),
                                    get(this.state, 'watchList.users')) }
                                cancelDisabled={this.state.saving}
                            />
                        }
                    </div>
                </div>
            </div>
        );
    }
}

WatchListEditor.propTypes = {
    watchList: PropTypes.object,
    closeEditor: PropTypes.func,
    onTopicChanged: PropTypes.func,
    hideModal: PropTypes.func,
    loadMyTopic: PropTypes.func,
    isAdmin: PropTypes.bool,
    fetchCompanyUsers: PropTypes.func,
    item: PropTypes.object,
    user: PropTypes.string,
    saveWatchList: PropTypes.func,
    watchListUsers: PropTypes.array,
};

const mapStateToProps = (state) => ({
    watchListUsers: state.watchListUsers || [],
    user: get(state, 'editedUser._id'),
});

const mapDispatchToProps = (dispatch) => ({
    saveWatchList: (item, notifyMsg) => dispatch(postWatchList(item, notifyMsg)),
    fetchCompanyUsers: (companyId) => dispatch(fetchCompanyUsers(companyId, true)),
});

export default connect(mapStateToProps, mapDispatchToProps)(WatchListEditor);
