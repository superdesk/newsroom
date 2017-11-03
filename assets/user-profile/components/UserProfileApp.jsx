import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    fetchTopics,
    fetchUser,
    editUser,
    updateMenu,
    editTopic,
    shareTopic,
    deleteTopic,
    saveUser,
    setError,
} from '../actions';
import FollowedTopics from './topics/FollowedTopics';
import UserProfileMenu from './UserProfileMenu';
import { gettext } from 'utils';
import FollowTopicModal from 'components/FollowTopicModal';
import UserProfile from './profile/UserProfile';

const modals = {
    followTopic: FollowTopicModal,
};

class UserProfileApp extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.isFormValid = this.isFormValid.bind(this);
        this.save = this.save.bind(this);
    }

    renderModal(specs) {
        if (specs) {
            const Modal = modals[specs.modal];
            return <Modal
                data={specs.data}
            />;
        }
    }

    isFormValid() {
        let valid = true;
        let errors = {};

        if (!this.props.user.first_name) {
            errors.first_name = [gettext('Please provide first name')];
            valid = false;
        }

        if (!this.props.user.last_name) {
            errors.last_name = [gettext('Please provide last name')];
            valid = false;
        }

        this.props.setError(errors);
        return valid;
    }

    save(event) {
        event.preventDefault();

        if (!this.isFormValid()) {
            return;
        }

        this.props.saveUser();
    }

    render() {
        const modal = this.renderModal(this.props.modal);
        return (
            <div className="settings-inner">
                <div className='side-navigation' id='profile-menu'>
                    <UserProfileMenu
                        onClick={this.props.selectMenu}
                        isProfile={this.props.selectedMenu === 'profile'}
                        isFollowedTopics={this.props.selectedMenu === 'topics'}
                        isDownloadHistory={this.props.selectedMenu === 'history'}
                    />
                </div>
                {this.props.selectedMenu === 'profile' ?
                    <div className="content">
                        <UserProfile
                            user={this.props.editedUser}
                            onSave={this.save}
                            onChange={this.props.editUser}
                            onCancel={() => this.props.fetchUser(this.props.user._id)}
                            errors={this.props.errors} />
                    </div> : null }
                {this.props.selectedMenu === 'topics' ?
                    <div className="content">
                        <FollowedTopics
                            topics={this.props.topics}
                            actions={this.props.actions}
                        />
                    </div> : null }
                {modal}
            </div>
        );
    }
}

UserProfileApp.propTypes = {
    user: PropTypes.object,
    editedUser: PropTypes.object,
    topics: PropTypes.arrayOf(PropTypes.object),
    topicsById: PropTypes.object,
    activeTopicId: PropTypes.string,
    isLoading: PropTypes.bool,
    selectMenu: PropTypes.func,
    selectedMenu: PropTypes.string,
    fetchTopics: PropTypes.func,
    fetchUser: PropTypes.func,
    saveUser: PropTypes.func,
    setError: PropTypes.func,
    editUser: PropTypes.func,
    actions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        action: PropTypes.func,
    })),
    modal: PropTypes.object,
    errors: PropTypes.object,
};

const mapStateToProps = (state) => ({
    user: state.user,
    editedUser: state.editedUser,
    topics: state.topics,
    topicsById: state.topicsById,
    activeTopicId: state.activeTopicId,
    isLoading: state.isLoading,
    selectedMenu: state.selectedMenu,
    modal: state.modal,
    errors: state.errors,
});

const mapDispatchToProps = (dispatch) => ({
    selectMenu: (event) => dispatch(updateMenu(event)),
    fetchTopics: (userId) => dispatch(fetchTopics(userId)),
    fetchUser: (id) => dispatch(fetchUser(id)),
    saveUser: () => dispatch(saveUser()),
    editUser: (event) => dispatch(editUser(event)),
    setError: (errors) => dispatch(setError(errors)),
    actions: [
        {
            name: gettext('Edit'),
            icon: 'edit',
            action: (topic) => dispatch(editTopic(topic)),
        },
        {
            name: gettext('Share'),
            icon: 'share',
            action: (topic) => dispatch(shareTopic(topic)),
        },
        {
            name: gettext('Delete'),
            icon: 'trash',
            action: (topic) => confirm(gettext('Would you like to delete topic {{name}}?', {name: topic.label})) && dispatch(deleteTopic(topic)),
        },
    ],
});

export default connect(mapStateToProps, mapDispatchToProps)(UserProfileApp);
