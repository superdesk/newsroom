import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { gettext } from 'utils';

import TextInput from 'components/TextInput';
import SelectInput from 'components/SelectInput';
import CheckboxInput from 'components/CheckboxInput';

import {
    fetchUser,
    editUser,
    saveUser,
    setError,
} from '../../actions';

class UserProfile extends React.Component {
    constructor(props) {
        super(props);
        this.save = this.save.bind(this);
    }

    isFormValid() {
        let valid = true;
        let errors = {};

        if (!this.props.user.first_name) {
            errors.first_name = [gettext('Please provide first name')];
            valid = false;
        }

        if (!this.props.user.last_name) {
            errors.last_name = [gettext('Please provide last name')];
            valid = false;
        }

        this.props.setError(errors);
        return valid;
    }

    save(event) {
        event.preventDefault();

        if (!this.isFormValid()) {
            return;
        }

        this.props.saveUser();
    }

    render() {
        const {user, onChange, errors} = this.props;
        const onCancel = () => this.props.fetchUser(this.props.user._id);
        const localeOptions = (window.locales || [])
            .filter((locale) => locale.locale !== window.locale) // this will be default value
            .map((locale) => ({value: locale.locale, text: locale.name}));
        return (
            <form className="profile-content container-fluid">
                <div className="row">
                    <div className="col-12 col-xl-8">
                        <div className="row pt-xl-4 pt-3 px-xl-4">
                            <div className="col-lg-6">
                                <TextInput
                                    name='first_name'
                                    label={gettext('First Name')}
                                    value={user.first_name}
                                    onChange={onChange}
                                    error={errors ? errors.first_name : null} />
                            </div>

                            <div className="col-lg-6">
                                <TextInput
                                    name='last_name'
                                    label={gettext('Last Name')}
                                    value={user.last_name}
                                    onChange={onChange}
                                    error={errors ? errors.last_name : null} />
                            </div>

                            <div className="col-lg-12">
                                <TextInput
                                    name='email'
                                    label={gettext('Email')}
                                    value={user.email}
                                    readOnly
                                />
                            </div>

                            <div className="col-lg-6">
                                <TextInput
                                    name='phone'
                                    label={gettext('Phone')}
                                    value={user.phone}
                                    onChange={onChange}
                                    error={errors ? errors.phone : null} />
                            </div>

                            <div className="col-lg-6">
                                <TextInput
                                    name='mobile'
                                    label={gettext('Mobile')}
                                    value={user.mobile}
                                    onChange={onChange}
                                    error={errors ? errors.mobile : null} />
                            </div>

                            <div className="col-lg-6">
                                <TextInput
                                    name='role'
                                    label={gettext('Role')}
                                    value={user.role}
                                    onChange={onChange}
                                    error={errors ? errors.role : null} />
                            </div>

                            <div className="col-lg-12">
                                <CheckboxInput
                                    name='receive_email'
                                    label={gettext('Receive notifications via email')}
                                    value={!!user.receive_email}
                                    onChange={onChange} />
                            </div>
                            {!!localeOptions.length &&
                                <div className="col-lg-6">
                                    <SelectInput
                                        name='locale'
                                        label={gettext('Language')}
                                        value={user.locale}
                                        onChange={onChange}
                                        options={localeOptions}
                                        defaultOption={window.locales.find((locale) => locale.locale === window.locale).name}
                                    />
                                </div>
                            }
                        </div>
                    </div>
                </div>

                <div className='profile-content__footer px-xl-4'>
                    <input
                        type='button'
                        className='btn btn-outline-secondary'
                        value={gettext('Cancel')}
                        onClick={onCancel} />

                    <input
                        type='button'
                        className='btn btn-outline-primary'
                        value={gettext('Save Changes')}
                        onClick={this.save} />
                </div>
            </form>
        );
    }
}

UserProfile.propTypes = {
    user: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    errors: PropTypes.object,
    saveUser: PropTypes.func,
    setError: PropTypes.func,
    fetchUser: PropTypes.func,
};

const mapStateToProps = (state) => ({
    user: state.editedUser,
    errors: state.errors,
});

const mapDispatchToProps = (dispatch) => ({
    saveUser: () => dispatch(saveUser()),
    fetchUser: (id) => dispatch(fetchUser(id)),
    onChange: (event) => dispatch(editUser(event)),
    setError: (errors) => dispatch(setError(errors)),
});

export default connect(mapStateToProps, mapDispatchToProps)(UserProfile);
