import React from 'react';
import PropTypes from 'prop-types';


function CheckboxInput({name, label, onChange, value}) {
    if (!name) {
        name = `input-${label}`;
    }

    return (
        <div className='form-check'>
            <label className='custom-control custom-checkbox'>
                <input type="checkbox"
                    name={name}
                    className="custom-control-input"
                    checked={value}
                    onChange={onChange} />
                <span className="custom-control-indicator"></span>
                <span className="custom-control-description">{' '}{label}</span>
            </label>
        </div>
    );
}

CheckboxInput.propTypes = {
    name: PropTypes.string,
    label: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.bool.isRequired,
};

export default CheckboxInput;
