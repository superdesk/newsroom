import React from 'react';
import PropTypes from 'prop-types';

function InputWrapper({error, name, label, children}) {
    let wrapperClass = 'form-group';

    if (error && error.length > 0) {
        wrapperClass += ' has-error';
    }

    if (!name) {
        name = `input-${label}`;
    }

    return (<div className={wrapperClass}>{children}</div>);
}

InputWrapper.propTypes = {
    error: PropTypes.object,
    name: PropTypes.string,
    children: PropTypes.node,
    label: PropTypes.string,
};

export default InputWrapper;
