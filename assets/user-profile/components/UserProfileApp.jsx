import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    fetchTopics,
    fetchUser,
    updateMenu,
    editTopic,
    shareTopic,
    deleteTopic,
} from '../actions';
import FollowedTopics from './topics/FollowedTopics';
import UserProfileMenu from './UserProfileMenu';
import { gettext } from 'utils';
import FollowTopicModal from 'components/FollowTopicModal';

const modals = {
    followTopic: FollowTopicModal,
};

class UserProfileApp extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    renderModal(specs) {
        if (specs) {
            const Modal = modals[specs.modal];
            return <Modal
                data={specs.data}
            />;
        }
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
    topics: PropTypes.arrayOf(PropTypes.object),
    topicsById: PropTypes.object,
    activeTopicId: PropTypes.string,
    isLoading: PropTypes.bool,
    selectMenu: PropTypes.func,
    selectedMenu: PropTypes.string,
    fetchTopics: PropTypes.func,
    fetchUser: PropTypes.func,
    actions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        action: PropTypes.func,
    })),
    modal: PropTypes.object,
};

const mapStateToProps = (state) => ({
    user: state.user,
    topics: state.topics,
    topicsById: state.topicsById,
    activeTopicId: state.activeTopicId,
    isLoading: state.isLoading,
    selectedMenu: state.selectedMenu,
    modal: state.modal,
});

const mapDispatchToProps = (dispatch) => ({
    selectMenu: (event) => dispatch(updateMenu(event)),
    fetchTopics: (userId) => dispatch(fetchTopics(userId)),
    fetchUser: (userId) => dispatch(fetchUser(userId)),
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
