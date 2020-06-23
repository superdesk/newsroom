import React from 'react';
import PropTypes from 'prop-types';

import InputWrapper from './InputWrapper';

function TextAreaInput({name, label, onChange, value, error, required, readOnly, maxLength, children}) {
    return (
        <InputWrapper error={error} name={name}>
            <label htmlFor={name}>{label}</label>
            <div className="field">
                <textarea
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
                {children}
            </div>
        </InputWrapper>
    );
}

TextAreaInput.propTypes = {
    label: PropTypes.string.isRequired,
    name: PropTypes.string,
    value: PropTypes.string,
    error: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,
    required: PropTypes.bool,
    readOnly: PropTypes.bool,
    maxLength: PropTypes.number,
    children: PropTypes.node,
};

export default TextAreaInput;
