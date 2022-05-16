from flask_wtf import FlaskForm
from flask_babel import gettext
from wtforms import StringField, HiddenField, BooleanField, TextAreaField
from wtforms import SelectField
from wtforms.validators import DataRequired, Email, Length, ValidationError, Regexp, Optional
from re import IGNORECASE
from newsroom.utils import is_safe_string, PHONE_REGEX


def validate_safe_string(Form, field):
    if not is_safe_string(field.data, allowed_punctuation="'"):
        raise ValidationError(gettext(' Illegal character'))


class UserForm(FlaskForm):
    class Meta:
        csrf = False

    BooleanField.false_values = {False, 'false', ''}

    user_types = [('administrator', gettext('Administrator')),
                  ('public', gettext('Public')),
                  ('internal', gettext('Internal')),
                  ('account_management', gettext('Account Management'))]

    id = HiddenField('Id')
    first_name = StringField(gettext('First Name'), validators=[DataRequired(), Length(min=1, max=50, message=gettext(
        'First name must be between 1 and 50 characters in length')), validate_safe_string])
    last_name = StringField(gettext('Last Name'), validators=[DataRequired(), Length(min=1, max=50, message=gettext(
        'Last name must be between 1 and 50 characters in length')), validate_safe_string])
    email = StringField(gettext('Email'), validators=[DataRequired(), Email(), Length(max=320)])
    phone = StringField(gettext('Telephone'), validators=[DataRequired(), Length(max=15), Regexp(PHONE_REGEX,
                                                                                                 flags=IGNORECASE)])
    mobile = StringField(gettext('Mobile'), validators=[Optional(), Length(max=15), Regexp(PHONE_REGEX,
                                                                                           flags=IGNORECASE)])
    role = StringField(gettext('Role'), validators=[Length(max=255), validate_safe_string])
    user_type = SelectField(gettext('User Type'), choices=user_types)
    company = StringField(gettext('Company'), validators=[])
    signup_details = TextAreaField(gettext('Sign Up Details'), validators=[])
    is_validated = BooleanField(gettext('Email Validated'), validators=[])
    is_enabled = BooleanField(gettext('Account Enabled'), default=True, validators=[])
    is_approved = BooleanField(gettext('Account Approved'), validators=[])
    expiry_alert = BooleanField(gettext('Company Expiry Alert'), validators=[])
    receive_email = BooleanField(gettext('Receive notifications via email'), default=True, validators=[])
    locale = StringField(gettext('Locale'))
