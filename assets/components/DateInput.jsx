import React from 'react';
import PropTypes from 'prop-types';

import InputWrapper from './InputWrapper';

function DateInput({name, label, onChange, value, error, required}) {
    return (
        <InputWrapper error={error} name={name}>
            <label htmlFor={name}>{label}</label>
            <div className="field">
                <input type="date"
                    id={name}
                    name={name}
                    className="form-control"
                    value={value}
                    onChange={onChange}
                    required={required}
                />
                {error && <div className="alert alert-danger">{error}</div>}
            </div>
        </InputWrapper>
    );
}

DateInput.propTypes = {
    label: PropTypes.string.isRequired,
    name: PropTypes.string,
    value: PropTypes.string,
    error: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,
    required: PropTypes.bool,
};

export default DateInput;
