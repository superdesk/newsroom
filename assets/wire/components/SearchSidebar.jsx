import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';

import { gettext } from 'utils';
import CloseButton from 'components/CloseButton';

import { removeBookmark } from '../actions';

function SearchSidebar(props) {

    const topicsList = props.topics.map((topic) => (
        <button key={topic._id}
            className={classNames('list-group-item', 'list-group-item-action', {
                active: topic.query === props.activeQuery,
            })}
            onClick={() => props.setQuery(topic.query)}
        >{topic.label}</button>
    ));

    const bookmarks = props.bookmarkedItems.map((_id) => {
        const item = props.itemsById[_id];
        return (
            <li key={_id} className="list-group-item">
                {item.headline}
                <CloseButton onClick={() => props.removeBookmark(_id)} />
            </li>
        );
    });

    return (
        <div>
            <h5>{gettext('Followed topics')}</h5>
            <div className="list-group">{topicsList}</div>
            {topicsList.length === 0 &&
                <div>{gettext('There are no followed topics yet.')}</div>
            }

            <p> </p>

            <h5>{gettext('Bookmarks')}</h5>
            <div className="list-group">{bookmarks}</div>
            {bookmarks.length === 0 &&
                <div>{gettext('There are no bookmarks yet.')}</div>
            }
        </div>
    );
}

SearchSidebar.propTypes = {
    activeQuery: PropTypes.string,
    topics: PropTypes.array.isRequired,
    setQuery: PropTypes.func.isRequired,
    bookmarkedItems: PropTypes.array.isRequired,
    itemsById: PropTypes.object.isRequired,
    removeBookmark: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
    bookmarkedItems: state.bookmarkedItems,
    itemsById: state.itemsById,
});

const mapDispatchToProps = (dispatch) => ({
    removeBookmark: (bookmark) => dispatch(removeBookmark(bookmark)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchSidebar);
