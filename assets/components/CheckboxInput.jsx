import React from 'react';
import PropTypes from 'prop-types';


function CheckboxInput({name, label, onChange, value}) {
    if (!name) {
        name = `input-${label}`;
    }

    return (
        <div className='form-check'>
            <label className='form-check-label'>
                <input type="checkbox"
                    name={name}
                    className="form-check-input"
                    checked={value}
                    onChange={onChange} />
                {' '}{label}</label>
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
