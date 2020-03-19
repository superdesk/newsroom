import React from 'react';
import PropTypes from 'prop-types';
import {monitoringList} from '../selectors';
import EditMonitoringProfile from './EditMonitoringProfile';
import MonitoringList from './MonitoringList';
import {
    deleteMonitoringProfile,
    updateMonitoringProfile,
    postMonitoringProfile,
    selectMonitoringProfile,
    setError,
    cancelEdit,
    saveMonitoringProfileUsers,
    saveMonitoringProfileSchedule,
} from '../actions';
import {gettext} from 'utils';
import {connect} from 'react-redux';
import {fetchCompanyUsers} from '../../companies/actions';


class MonitoringPanel extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.isFormValid = this.isFormValid.bind(this);
        this.save = this.save.bind(this);
        this.deleteMonitoringProfile = this.deleteMonitoringProfile.bind(this);
    }

    isFormValid() {
        let valid = true;
        let errors = {};
        const wl = this.props.monitoringProfileToEdit;

        if (!wl.name) {
            errors.name = [gettext('Please provide a name')];
            valid = false;
        }

        if (!wl.company) {
            errors.company = [gettext('Please provide a company')];
            valid = false;
        }

        if (!wl.query) {
            errors.query = [gettext('Please provide a query')];
            valid = false;
        }

        this.props.dispatch(setError(errors));
        return valid;
    }

    save(event) {
        event.preventDefault();

        if (!this.isFormValid()) {
            return;
        }

        this.props.postMonitoringProfile();
    }

    deleteMonitoringProfile(event) {
        event.preventDefault();

        confirm(gettext('Would you like to delete the Monitoring Profile: {{name}}?',
            {name: this.props.monitoringProfileToEdit.name})) &&
            this.props.deleteMonitoringProfile();
    }

    render() {
        return (
            <div className="flex-row">
                <div className="flex-col flex-column">
                    {<MonitoringList
                        list={this.props.monitoringList}
                        onClick={this.props.selectMonitoringProfile}
                        activeMonitoringProfileId={this.props.activeMonitoringProfileId}
                        companiesById={this.props.companiesById}/>}
                </div>
                {this.props.monitoringProfileToEdit &&
                    <EditMonitoringProfile
                        item={this.props.monitoringProfileToEdit}
                        onChange={this.props.updateMonitoringProfile}
                        errors={this.props.errors}
                        companies={this.props.companies}
                        onSave={this.save}
                        onClose={this.props.cancelEdit}
                        onDelete={this.deleteMonitoringProfile}
                        users={this.props.monitoringUsers}
                        fetchCompanyUsers={this.props.fetchCompanyUsers}
                        saveMonitoringProfileUsers={this.props.saveMonitoringProfileUsers}
                        saveMonitoringProfileSchedule={this.props.saveMonitoringProfileSchedule}
                        scheduleMode={this.props.scheduleMode}
                    />
                }
            </div>
        );
    }
}

MonitoringPanel.propTypes = {
    monitoringList: PropTypes.arrayOf(PropTypes.object),
    monitoringProfileToEdit: PropTypes.object,
    updateMonitoringProfile: PropTypes.func,
    postMonitoringProfile: PropTypes.func,
    deleteMonitoringProfile: PropTypes.func,
    cancelEdit: PropTypes.func,
    companies: PropTypes.arrayOf(PropTypes.object),
    companiesById: PropTypes.object,
    errors: PropTypes.object,
    dispatch: PropTypes.func,
    scheduleMode: PropTypes.bool,
    selectMonitoringProfile: PropTypes.func,
    activeMonitoringProfileId: PropTypes.string,
    monitoringUsers: PropTypes.arrayOf(PropTypes.object),
    fetchCompanyUsers: PropTypes.func,
    saveMonitoringProfileUsers: PropTypes.func,
    saveMonitoringProfileSchedule: PropTypes.func,
};

const mapStateToProps = (state) => ({
    monitoringList: monitoringList(state),
    monitoringProfileToEdit: state.monitoringProfileToEdit,
    companies: state.companies,
    companiesById: state.companiesById,
    errors: state.errors,
    monitoringUsers: state.monitoringUsers || [],
    scheduleMode: state.scheduleMode,
});

const mapDispatchToProps = (dispatch) => ({
    selectMonitoringProfile: (_id) => dispatch(selectMonitoringProfile(_id)),
    updateMonitoringProfile: (event) => dispatch(updateMonitoringProfile(event)),
    postMonitoringProfile: () => dispatch(postMonitoringProfile()),
    deleteMonitoringProfile: (type) => dispatch(deleteMonitoringProfile(type)),
    cancelEdit: (event) => dispatch(cancelEdit(event)),
    fetchCompanyUsers: (companyId) => dispatch(fetchCompanyUsers(companyId, true)),
    saveMonitoringProfileUsers: (users) => dispatch(saveMonitoringProfileUsers(users)),
    saveMonitoringProfileSchedule: () => dispatch(saveMonitoringProfileSchedule()),
    dispatch: dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(MonitoringPanel);
