import React from 'react';
import PropTypes from 'prop-types';


function TextInput({type, name, label, onChange, value, error, required, readOnly, maxLength, placeholder, description, min}) {
    let wrapperClass = 'form-group';

    if (error && error.length > 0) {
        wrapperClass += ' has-error';
    }

    if (!name) {
        name = `input-${label}`;
    }

    return (
        <div className={wrapperClass}>
            {label && (
                <label htmlFor={name}>{label}</label>
            )}
            <div className="field">
                <input
                    type={type || 'text'}
                    id={name}
                    name={name}
                    className="form-control"
                    value={value}
                    onChange={onChange}
                    required={required}
                    maxLength={maxLength}
                    readOnly={readOnly}
                    placeholder={placeholder}
                    min={min}
                />
                {error && <div className="alert alert-danger">{error}</div>}
                {description && <small className="form-text text-muted">{description}</small>}
            </div>
        </div>
    );
}

TextInput.propTypes = {
    type: PropTypes.string,
    label: PropTypes.string,
    name: PropTypes.string,
    value: PropTypes.string,
    error: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,
    required: PropTypes.bool,
    readOnly: PropTypes.bool,
    maxLength: PropTypes.number,
    placeholder: PropTypes.string,
    description: PropTypes.string,
    min: PropTypes.number,
};

export default TextInput;
