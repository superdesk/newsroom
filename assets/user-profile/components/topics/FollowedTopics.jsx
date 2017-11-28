import React from 'react';
import PropTypes from 'prop-types';
import {gettext, getLocaleDate} from 'utils';
import { connect } from 'react-redux';
import ActionButton from 'components/ActionButton';
import {
    fetchTopics,
    editTopic,
    shareTopic,
    deleteTopic,
} from '../../actions';

class FollowedTopics extends React.Component {
    constructor(props, context) {
        super(props, context);
        props.fetchTopics();
    }

    getActionButtons(topic) {
        return this.props.actions.map((action) => (
            <ActionButton
                key={action.name}
                item={topic}
                className='icon-button'
                displayName={false}
                action={action}
            />
        ));
    }

    render() {
        return (
            <div className="profile-content container-fluid">
                <div className="row pt-xl-4 pt-3 px-xl-4">
                    {this.props.topics && this.props.topics.map((topic) => (
                        <div key={topic._id} className='simple-card-wrap col-12 col-lg-6'>
                            <div className="simple-card">
                                <div className="simple-card__header simple-card__header-with-icons">
                                    <h6 className="simple-card__headline">{topic.label}</h6>
                                    <div className='simple-card__icons'>
                                        {this.getActionButtons(topic)}
                                    </div>
                                </div>
                                <p>{topic.description || ' '}</p>
                                <span className="simple-card__date">{gettext('Created on')} {getLocaleDate(topic._created)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

FollowedTopics.propTypes = {
    fetchTopics: PropTypes.func.isRequired,
    topics: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,
        _created: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        description: PropTypes.string,
    })),
    actions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        action: PropTypes.func,
    }))
};

const mapStateToProps = (state) => ({
    topics: state.topics,
});

const mapDispatchToProps = (dispatch) => ({
    fetchTopics: () => dispatch(fetchTopics()),
    actions: [
        {
            name: gettext('Edit'),
            icon: 'edit',
            action: (topic) => dispatch(editTopic(topic)),
        },
        {
            name: gettext('Share'),
            icon: 'share',
            action: (topic) => dispatch(shareTopic([topic])),
        },
        {
            name: gettext('Delete'),
            icon: 'trash',
            action: (topic) => confirm(gettext('Would you like to delete topic {{name}}?', {name: topic.label})) && dispatch(deleteTopic(topic)),
        },
    ],
});

export default connect(mapStateToProps, mapDispatchToProps)(FollowedTopics);
