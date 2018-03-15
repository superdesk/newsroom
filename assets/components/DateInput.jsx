import React from 'react';
import PropTypes from 'prop-types';


function DateInput({name, label, onChange, value, error, required}) {
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
        </div>
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
