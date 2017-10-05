import React from 'react';
import PropTypes from 'prop-types';

function CloseButton({onClick}) {
    return (
        <button type="button"
            className="close"
            aria-label="Close"
            onClick={onClick}>
            <span aria-hidden="true">&times;</span>
        </button>
    );
}

CloseButton.propTypes = {
    onClick: PropTypes.func.isRequired,
};

export default CloseButton;
