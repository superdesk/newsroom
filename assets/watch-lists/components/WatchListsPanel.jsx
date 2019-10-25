import React from 'react';
import PropTypes from 'prop-types';
import {watchListsList} from '../selectors';
import EditWatchList from './EditWatchList';
import WatchList from './WatchList';
import {
    deleteWatchList,
    updateWatchList,
    postWatchList,
    selectWatchList,
    setError,
    cancelEdit,
    saveWatchListUsers,
    saveWatchListSchedule,
} from '../actions';
import {gettext} from 'utils';
import {connect} from 'react-redux';
import {fetchCompanyUsers} from '../../companies/actions';


class WatchListsPanel extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.isFormValid = this.isFormValid.bind(this);
        this.save = this.save.bind(this);
        this.deleteWatchList = this.deleteWatchList.bind(this);
    }

    isFormValid() {
        let valid = true;
        let errors = {};
        const wl = this.props.watchListToEdit;

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

        this.props.postWatchList();
    }

    deleteWatchList(event) {
        event.preventDefault();

        confirm(gettext('Would you like to delete the watch list: {{name}}?',
            {name: this.props.watchListToEdit.name})) &&
            this.props.deleteWatchList();
    }

    render() {
        return (
            <div className="flex-row">
                <div className="flex-col flex-column">
                    {<WatchList
                        watchLists={this.props.watchLists}
                        onClick={this.props.selectWatchList}
                        activeWatchListId={this.props.activeWatchListId}
                        companiesById={this.props.companiesById}/>}
                </div>
                {this.props.watchListToEdit &&
                    <EditWatchList
                        item={this.props.watchListToEdit}
                        onChange={this.props.updateWatchList}
                        errors={this.props.errors}
                        companies={this.props.companies}
                        onSave={this.save}
                        onClose={this.props.cancelEdit}
                        onDelete={this.deleteWatchList}
                        users={this.props.watchListUsers}
                        fetchCompanyUsers={this.props.fetchCompanyUsers}
                        saveWatchListUsers={this.props.saveWatchListUsers}
                        saveWatchListSchedule={this.props.saveWatchListSchedule}
                        scheduleMode={this.props.scheduleMode}
                    />
                }
            </div>
        );
    }
}

WatchListsPanel.propTypes = {
    watchLists: PropTypes.arrayOf(PropTypes.object),
    watchListToEdit: PropTypes.object,
    updateWatchList: PropTypes.func,
    postWatchList: PropTypes.func,
    deleteWatchList: PropTypes.func,
    cancelEdit: PropTypes.func,
    companies: PropTypes.arrayOf(PropTypes.object),
    companiesById: PropTypes.object,
    errors: PropTypes.object,
    dispatch: PropTypes.func,
    scheduleMode: PropTypes.bool,
    selectWatchList: PropTypes.func,
    activeWatchListId: PropTypes.string,
    watchListUsers: PropTypes.arrayOf(PropTypes.object),
    fetchCompanyUsers: PropTypes.func,
    saveWatchListUsers: PropTypes.func,
    saveWatchListSchedule: PropTypes.func,
};

const mapStateToProps = (state) => ({
    watchLists: watchListsList(state),
    watchListToEdit: state.watchListToEdit,
    companies: state.companies,
    companiesById: state.companiesById,
    errors: state.errors,
    watchListUsers: state.watchListUsers || [],
    scheduleMode: state.scheduleMode,
});

const mapDispatchToProps = (dispatch) => ({
    selectWatchList: (_id) => dispatch(selectWatchList(_id)),
    updateWatchList: (event) => dispatch(updateWatchList(event)),
    postWatchList: () => dispatch(postWatchList()),
    deleteWatchList: (type) => dispatch(deleteWatchList(type)),
    cancelEdit: (event) => dispatch(cancelEdit(event)),
    fetchCompanyUsers: (companyId) => dispatch(fetchCompanyUsers(companyId, true)),
    saveWatchListUsers: (users) => dispatch(saveWatchListUsers(users)),
    saveWatchListSchedule: () => dispatch(saveWatchListSchedule()),
    dispatch: dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(WatchListsPanel);
