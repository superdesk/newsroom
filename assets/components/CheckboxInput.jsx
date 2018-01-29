import React from 'react';
import PropTypes from 'prop-types';


function CheckboxInput({name, label, onChange, value}) {
    if (!name) {
        name = `input-${label}`;
    }

    return (
        <div className='form-check p-0'>                
            <div className='custom-control custom-checkbox'>
                <input type="checkbox"
                    name={name}
                    className="custom-control-input"
                    checked={value}
                    id={name}
                    onChange={onChange} />
                <label className="custom-control-label" htmlFor={name}>{label}</label>                
            </div>
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
