import React from 'react';
import PropTypes from 'prop-types';
import TextInput from 'components/TextInput';
import CheckboxInput from 'components/CheckboxInput';

import {gettext} from 'utils';

function UserProfile ({user, onChange, errors, onSave, onCancel}) {

    return (
        <form>
            <div className="list-item__preview-form">
                <TextInput
                    name='first_name'
                    label={gettext('First Name')}
                    value={user.first_name}
                    onChange={onChange}
                    error={errors ? errors.first_name : null} />

                <TextInput
                    name='last_name'
                    label={gettext('Last Name')}
                    value={user.last_name}
                    onChange={onChange}
                    error={errors ? errors.last_name : null} />

                <TextInput
                    name='phone'
                    label={gettext('Telephone')}
                    value={user.phone}
                    onChange={onChange}
                    error={errors ? errors.phone : null} />

                <CheckboxInput
                    name='receive_email'
                    label={gettext('Receive notifications via email')}
                    value={!!user.receive_email}
                    onChange={onChange} />

            </div>

            <div className='list-item__preview-footer'>
                <input
                    type='button'
                    className='wire-button'
                    value={gettext('Cancel')}
                    onClick={onCancel} />

                <input
                    type='button'
                    className='wire-button wire-button--active'
                    value={gettext('Save')}
                    onClick={onSave} />
            </div>


        </form>
    );
}


UserProfile.propTypes = {
    user: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    errors: PropTypes.object,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default UserProfile;
