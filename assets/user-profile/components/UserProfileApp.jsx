import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    hideModal,
    toggleDropdown,
    selectMenu,
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
        this.links = [
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
        ];
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

    renderProfile() {
        const links = this.links.map((link) => {
            link.active = link.name === this.props.selectedMenu;
            return link;
        });

        const modal = this.renderModal(this.props.modal);
        const ActiveContent = links.find((link) => link.active).content;

        return (
            <div className="profile-container">
                <div className="profileWrap">
                    <div className="profile__mobile-close d-md-none">
                        <button className="icon-button" onClick={this.props.hideModal}>
                            <i className="icon--close-thin icon--gray-light"></i></button>
                    </div>
                    <nav className='profile-side-navigation' id='profile-menu'>
                        <UserProfileAvatar
                            user={this.props.user}
                        />
                        <UserProfileMenu
                            onClick={this.props.selectMenu}
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
                                    <span className="content-bar__menu" onClick={this.props.hideModal}>
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
            this.props.displayModal ? this.renderProfile() : null,
            document.getElementById('user-profile-app')
        );

        const dropdown = this.props.dropdown && (
            <div key="dropdown" className="dropdown-menu dropdown-menu-right show">
                <div className="card card--inside-dropdown">
                    <div className="card-header">
                        {`${this.props.user.first_name} ${this.props.user.last_name}`}
                    </div>               
                    <ul className="list-group list-group-flush">
                        {this.links.map((link) => (
                            <li key={link.name} className="list-group-item list-group-item--link">
                                <a href="" onClick={(e) => this.props.selectMenu(e, link.name)}>{link.label}
                                    <i className="svg-icon--arrow-right" /></a>
                            </li>
                        ))}
                    </ul>
                    <div className="card-footer">
                        <a href="/logout" className="btn btn-outline-secondary float-right">{gettext('Logout')}</a>
                    </div>
                </div>
            </div>
        );

        const toggle = document.getElementById('header-profile-toggle');

        if (this.props.dropdown) {
            toggle.classList.add('show');
        } else {
            toggle.classList.remove('show');
        }

        return [
            <ProfileToggle key="toggle"
                user={this.props.user}
                onClick={this.props.toggleDropdown}
            />,
            dropdown,
            profile,
        ];
    }
}

UserProfileApp.propTypes = {
    user: PropTypes.object,
    modal: PropTypes.object,
    selectMenu: PropTypes.func,
    dropdown: PropTypes.bool,
    selectedMenu: PropTypes.string,
    displayModal: PropTypes.bool,
    toggleDropdown: PropTypes.func,
    hideModal: PropTypes.func,
};

const mapStateToProps = (state) => ({
    user: state.user,
    modal: state.modal,
    dropdown: state.dropdown,
    selectedMenu: state.selectedMenu,
    displayModal: state.displayModal,
});

const mapDispatchToProps = (dispatch) => ({
    selectMenu: (event, name) => {event.preventDefault(); dispatch(selectMenu(name));},
    toggleDropdown: () => dispatch(toggleDropdown()),
    hideModal: () => dispatch(hideModal()),
});

export default connect(mapStateToProps, mapDispatchToProps)(UserProfileApp);
