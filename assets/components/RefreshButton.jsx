import React from 'react';
import PropTypes from 'prop-types';

function RefreshButton({count, onClick}) {
    return (
        <div className="d-flex mt-3 justify-content-end">
            <button type="button" className="button__reset-styles d-flex align-items-center" onClick={onClick}>
                <i className="icon--refresh icon--pink" />
                <span className="badge badge-pill badge-info badge-secondary ml-2">{count}</span>
            </button>
        </div>
    );
}

RefreshButton.propTypes = {
    count: PropTypes.number.isRequired,
    onClick: PropTypes.func.isRequired,
};

export default RefreshButton;
