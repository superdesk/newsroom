import React from 'react';
import PropTypes from 'prop-types';
import { gettext } from 'utils';


const TextInput = ({name, label, onChange, value, error}) => {
    let wrapperClass = 'form-group';
    if (error && error.length > 0) {
        wrapperClass += ' has-error';
    }
    return (
        <div className={wrapperClass}>
            <label htmlFor="{name}">{gettext(label)}</label>
            <div className="field">
                <input
                    type="text"
                    name={name}
                    className="form-control"
                    value={value}
                    onChange={onChange} />
                {error && <div className="alert alert-danger">{error}</div>}
            </div>
        </div>
    );
};

TextInput.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
    error: PropTypes.arrayOf(PropTypes.string)
};

export default TextInput;
