import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    updateMenu,
} from '../actions';
import FollowedTopics from './topics/FollowedTopics';
import UserProfileMenu from './UserProfileMenu';
import UserProfileAvatar from './UserProfileAvatar';
import { gettext } from 'utils';
import FollowTopicModal from 'components/FollowTopicModal';
import ShareItemModal from 'components/ShareItemModal';
import UserProfile from './profile/UserProfile';
import ProfileToggle from './ProfileToggle';

const modals = {
    followTopic: FollowTopicModal,
    shareItem: ShareItemModal,
};

class UserProfileApp extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.close = this.close.bind(this);
        this.selectMenu = this.selectMenu.bind(this);
        this.state = {open: false, selectedMenu: 'profile'};
    }

    selectMenu(selectedMenu) {
        this.setState({selectedMenu});
    }

    renderModal(specs) {
        if (specs) {
            const Modal = modals[specs.modal];
            return ReactDOM.createPortal(
                <Modal data={specs.data} />,
                document.getElementById('modal-container')
            );
        }
    }

    close() {
        this.setState({open: false, selectedMenu: 'profile'});
    }

    renderProfile() {
        const links = [
            {
                name: 'profile',
                label: gettext('My Profile'),
                content: UserProfile,
            },
            {
                name: 'topics',
                label: gettext('My Topics'),
                content: FollowedTopics,
            },
            /**
            {
                name: 'history',
                label: gettext('Download History'),
            },
            */
        ].map((link) => {
            link.active = link.name === this.state.selectedMenu;
            return link;
        });

        const modal = this.renderModal(this.props.modal);
        const ActiveContent = links.find((link) => link.active).content;

        return (
            <div className="profile-container">
                <div className="profileWrap">
                    <div className="profile__mobile-close d-md-none">
                        <button className="icon-button" onClick={this.close}><i className="icon--close-thin icon--gray-light"></i></button>
                    </div>
                    <nav className='profile-side-navigation' id='profile-menu'>
                        <UserProfileAvatar
                            user={this.props.user}
                        />
                        <UserProfileMenu
                            onClick={this.selectMenu}
                            links={links}
                        />
                    </nav>
                    <div className="content">
                        <section className="content-header">
                            <nav className="profile-nav content-bar navbar content-bar--side-padding pr-0 d-none d-md-flex">
                                <h5 className="pl-xl-4 mb-0">
                                    {links.find((link) => link.active).label}
                                </h5>
                                <div className="content-bar__right">
                                    <span className="content-bar__menu" onClick={this.close}>
                                        <i className="icon--close-thin" />
                                    </span>
                                </div>
                            </nav>
                        </section>
                        <section className="content-main">
                            <ActiveContent />
                        </section>
                    </div>
                    {modal}
                </div>
            </div>
        );
    }

    render() {
        const profile = ReactDOM.createPortal(
            this.state.open ? this.renderProfile() : null,
            document.getElementById('user-profile-app')
        );

        return [
            <ProfileToggle key="toggle"
                user={this.props.user}
                onClick={() => this.setState({open: !this.state.open})}
            />,
            profile,
        ];
    }
}

UserProfileApp.propTypes = {
    user: PropTypes.object,
    modal: PropTypes.object,
    selectMenu: PropTypes.func,
};

const mapStateToProps = (state) => ({
    user: state.user,
    modal: state.modal,
});

const mapDispatchToProps = (dispatch) => ({
    selectMenu: (event) => dispatch(updateMenu(event)),
});

export default connect(mapStateToProps, mapDispatchToProps)(UserProfileApp);
