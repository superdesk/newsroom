import React from 'react';
import PropTypes from 'prop-types';


function FileInput({name, label, onChange, error, accept, required}) {
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
                <input type="file"
                    id={name}
                    name={name}
                    className="form-control"
                    onChange={onChange}
                    accept={accept}
                    required={required}
                />
                {error && <div className="alert alert-danger">{error}</div>}
            </div>
        </div>
    );
}

FileInput.propTypes = {
    label: PropTypes.string.isRequired,
    name: PropTypes.string,
    error: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,
    accept: PropTypes.string,
    required: PropTypes.bool,
};

export default FileInput;
