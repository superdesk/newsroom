import React from 'react';
import PropTypes from 'prop-types';
import {get} from 'lodash';

import {getLocaleDate, gettext} from 'utils';
import ActionButton from 'components/ActionButton';

const TopicList = ({topics, actions}) => {
    if (get(topics, 'length', 0) < 0) {
        return null;
    }

    const getActionButtons = (topic) => actions.map(
        (action) => (
            <ActionButton
                key={action.name}
                item={topic}
                className='icon-button'
                displayName={false}
                action={action}
            />
        )
    );

    return topics.map(
        (topic) => (
            <div key={topic._id} className='simple-card-wrap col-12 col-lg-6'>
                <div className="simple-card">
                    <div className="simple-card__header simple-card__header-with-icons">
                        <h6 className="simple-card__headline">{topic.label || topic.name}</h6>
                        <div className='simple-card__icons'>
                            {getActionButtons(topic)}
                        </div>
                    </div>
                    <p>{topic.description || ' '}</p>
                    <span className="simple-card__date">
                        {gettext('Created on')} {getLocaleDate(topic._created)}
                    </span>
                </div>
            </div>
        )
    );
};

TopicList.propTypes = {
    topics: PropTypes.arrayOf(PropTypes.object),
    actions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        icon: PropTypes.string,
        action: PropTypes.func,
    })),
};

export default TopicList;
