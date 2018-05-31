import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';


function CheckboxInput({name, label, onChange, value, labelClass}) {
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
                <label className={classNames('custom-control-label', labelClass)} htmlFor={name}>{label}</label>
            </div>
        </div>
    );
}

CheckboxInput.propTypes = {
    name: PropTypes.string,
    label: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.bool.isRequired,
    labelClass: PropTypes.string,
};

export default CheckboxInput;
