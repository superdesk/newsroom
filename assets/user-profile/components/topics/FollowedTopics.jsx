import React from 'react';
import PropTypes from 'prop-types';
import {gettext, shortDate} from 'utils';

class FollowedTopics extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.getActionButtons = this.getActionButtons.bind(this);
    }

    getActionButtons(topic) {
        return this.props.actions.map((action) => (
            <button className='icon-button'
                key={action.name}
                onClick={() => action.action(topic)}>
                <i className={`icon--${action.icon}`}></i>
            </button>)
        );
    }


    render() {
        return (
            this.props.topics && this.props.topics.map((topic) => (
                <div key={topic._id} className='card'  style={{width: '20rem', margin: '10px'}}>
                    <div className="card-header">
                        {topic.label}
                        <div className='wire-column__preview__buttons'>
                            {this.getActionButtons(topic)}
                        </div>
                    </div>
                    <div className='card-block'>
                        <p>{topic.description}</p>
                        <footer>{gettext('Created on')} {shortDate(topic._created)}</footer>
                    </div>
                </div>)));
    }
}

FollowedTopics.propTypes = {
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

export default FollowedTopics;
