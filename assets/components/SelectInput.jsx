import React from 'react';
import PropTypes from 'prop-types';

const SelectInput = ({
    name,
    label,
    onChange,
    defaultOption,
    value,
    error,
    options,
    className,
    readOnly}) => {
    return (
        <div className={className ? className : 'form-group'}>
            <label htmlFor={name}>{label}</label>
            <div className="field">
                <select
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="form-control"
                    disabled={readOnly}>
                    {defaultOption != null &&
                        <option value="">{defaultOption}</option>
                    }
                    {options.map((option) => {
                        return <option key={option.value} value={option.value}>{option.text}</option>;
                    })}
                </select>
                {error && <div className="alert alert-danger">{error}</div>}
            </div>
        </div>
    );
};

SelectInput.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    defaultOption: PropTypes.string,
    value: PropTypes.string,
    error: PropTypes.arrayOf(PropTypes.string),
    options: PropTypes.arrayOf(PropTypes.shape({
        text: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
    })).isRequired,
    className: PropTypes.string,
    readOnly: PropTypes.bool,
};

export default SelectInput;
