import React from 'react';
import PropTypes from 'prop-types';
import TextInput from '../../../common/components/TextInput';
import SelectInput from '../../../common/components/SelectInput';
import CheckboxInput from '../../../common/components/CheckboxInput';

import { gettext } from '../../../utils';

const countries = [
    {value: 'au', text: gettext('Australia')},
    {value: 'nz', text: gettext('New Zealand')},
    {value: 'other', text: gettext('Other')},
];

function EditCompany({company, onChange, errors, onSave, onClose}) {
    return (
        <div className="col">
            <div className="modal-header">
                <button
                    id="hide-sidebar"
                    type="button"
                    className="close"
                    data-dismiss="modal"
                    aria-label="Close"
                    onClick={onClose}>
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>

            <form>
                <TextInput
                    name="name"
                    label="Name"
                    value={company.name}
                    onChange={onChange}
                    error={errors ? errors.name : null} />

                <TextInput
                    name="sd_subscriber_id"
                    label="Superdesk Subscriber Id"
                    value={company.sd_subscriber_id}
                    onChange={onChange}
                    error={errors ? errors.sd_subscriber_id : null} />

                <TextInput
                    name="phone"
                    label="Telephone"
                    value={company.phone}
                    onChange={onChange}
                    error={errors ? errors.phone : null} />

                <TextInput
                    name="contact_name"
                    label="Contact Name"
                    value={company.contact_name}
                    onChange={onChange}
                    error={errors ? errors.contact_name : null} />

                <SelectInput
                    name="country"
                    label="Country"
                    value={company.country}
                    defaultOption=""
                    options={countries}
                    onChange={onChange}
                    error={errors ? errors.user_type : null} />

                <CheckboxInput
                    name="is_enabled"
                    label="Enabled"
                    value={company.is_enabled}
                    onChange={onChange} />


                <div className="modal-footer">
                    <input
                        type="button"
                        className="btn btn-primary"
                        value={gettext('Save')}
                        onClick={onSave} />
                </div>


            </form>
        </div>
    );
}

EditCompany.propTypes = {
    company: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    errors: PropTypes.object,
    users: PropTypes.arrayOf(PropTypes.object),
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default EditCompany;
