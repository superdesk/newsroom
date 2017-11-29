import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

function BookmarksCount({count}) {
    return ReactDOM.createPortal(
        <b className='font-weight-normal'>{count}</b>,
        document.getElementById('bookmarks-count')
    );
}

BookmarksCount.propTypes = {
    count: PropTypes.number.isRequired,
};

export default BookmarksCount;
