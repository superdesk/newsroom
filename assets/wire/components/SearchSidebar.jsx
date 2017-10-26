import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';

import { gettext } from 'utils';
import CloseButton from 'components/CloseButton';

import { removeBookmark } from '../actions';

function SearchSidebar(props) {

    const query = (e, topic) => {
        e.preventDefault();
        props.setQuery(topic.query);
    };

    const topicsList = props.topics.map((topic) => (
        <a href='#' key={topic._id}
            className={classNames('btn btn-outline-secondary', {
                active: topic.query === props.activeQuery,
            })}
            onClick={(e) => query(e, topic)}>
            {topic.label} <span className='wire-button__notif'>8</span></a>
    ));

    const bookmarks = props.bookmarkedItems.map((_id) => {
        const item = props.itemsById[_id];
        return (
            <li key={_id} className='list-group-item'>
                {item.headline}
                <CloseButton onClick={() => props.removeBookmark(_id)} />
            </li>
        );
    });

    return (
        <div className='wire-column__nav__items'>
            <ul className='nav justify-content-center mb-3' id='pills-tab' role='tablist'>
                <li className='wire-column__nav__tab nav-item'>
                    <a className='nav-link active' id='pills-home-tab' data-toggle='pill' href='#pills-home' role='tab' aria-controls='pills-home' aria-expanded='true'>Navigation</a>
                </li>
                <li className='wire-column__nav__tab nav-item'>
                    <a className='nav-link' id='pills-profile-tab' data-toggle='pill' href='#pills-profile' role='tab' aria-controls='pills-profile' aria-expanded='true'>Filters</a>
                </li>
            </ul>
            <div className='tab-content' id='pills-tabContent'>
                <div className='tab-pane fade show active' id='pills-home' role='tabpanel' aria-labelledby='pills-home-tab'>
                    <a href='#' className='btn btn-outline-primary'>All</a>
                    <a href='#' className='btn btn-outline-secondary'>National</a>
                    <a href='#' className='btn btn-outline-secondary'>Courts</a>
                    <a href='#' className='btn btn-outline-secondary'>Entertainment</a>

                    <span className='wire-column__nav__divider'></span>
                    <h5>{gettext('Followed topics')}</h5>

                    {topicsList}

                    {topicsList.length === 0 &&
                            <i>{gettext('There are no followed topics yet.')}</i>
                    }

                    <span className='wire-column__nav__divider'></span>
                    <h5>{gettext('Bookmarks')}</h5>

                    {bookmarks}

                    {bookmarks.length === 0 &&
                            <i>{gettext('There are no bookmarks yet.')}</i>
                    }

                </div>
                <div className='tab-pane fade' id='pills-profile' role='tabpanel' aria-labelledby='pills-profile-tab'>
                    <a href='#' className='btn btn-outline-primary'>All</a>
                    <a href='#' className='btn btn-outline-secondary'>Filter 1</a>
                    <a href='#' className='btn btn-outline-secondary'>Filter 2</a>
                    <a href='#' className='btn btn-outline-secondary'>Filter 3</a>
                </div>
            </div>
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
    bookmarkedItems: state.bookmarkedItems || [],
    itemsById: state.itemsById,
});

const mapDispatchToProps = (dispatch) => ({
    removeBookmark: (bookmark) => dispatch(removeBookmark(bookmark)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchSidebar);
