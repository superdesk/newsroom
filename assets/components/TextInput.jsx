import React from 'react';
import PropTypes from 'prop-types';


function TextInput({name, label, onChange, value, error, required, readOnly, maxLength}) {
    let wrapperClass = 'form-group';

    if (error && error.length > 0) {
        wrapperClass += ' has-error';
    }

    if (!name) {
        name = `input-${label}`;
    }

    return (
        <div className={wrapperClass}>
            <label htmlFor={name}>{label}</label>
            <div className="field">
                <input type="text"
                    id={name}
                    name={name}
                    className="form-control"
                    value={value}
                    onChange={onChange}
                    required={required}
                    maxLength={maxLength}
                    readOnly={readOnly}
                />
                {error && <div className="alert alert-danger">{error}</div>}
            </div>
        </div>
    );
}

TextInput.propTypes = {
    label: PropTypes.string.isRequired,
    name: PropTypes.string,
    value: PropTypes.string,
    error: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,
    required: PropTypes.bool,
    readOnly: PropTypes.bool,
    maxLength: PropTypes.number,
};

export default TextInput;
