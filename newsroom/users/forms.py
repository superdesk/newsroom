from flask_wtf import FlaskForm
from flask_babel import gettext
from wtforms import StringField, HiddenField, BooleanField, TextAreaField
from wtforms import SelectField
from wtforms.validators import DataRequired, Email


class UserForm(FlaskForm):
    class Meta:
        csrf = False

    BooleanField.false_values = {False, 'false', ''}

    user_types = [('administrator', gettext('Administrator')),
                  ('public', gettext('Public')),
                  ('internal', gettext('Internal'))]

    id = HiddenField('Id')
    first_name = StringField(gettext('First Name'), validators=[DataRequired()])
    last_name = StringField(gettext('Last Name'), validators=[DataRequired()])
    email = StringField(gettext('Email'), validators=[DataRequired(), Email()])
    phone = StringField(gettext('Telephone'), validators=[DataRequired()])
    mobile = StringField(gettext('Mobile'), validators=[])
    role = StringField(gettext('Role'), validators=[])
    user_type = SelectField(gettext('User Type'), choices=user_types)
    company = StringField(gettext('Company'), validators=[])
    signup_details = TextAreaField(gettext('Sign Up Details'), validators=[])
    is_validated = BooleanField(gettext('Email Validated'), validators=[])
    is_enabled = BooleanField(gettext('Account Enabled'), default=True, validators=[])
    is_approved = BooleanField(gettext('Account Approved'), validators=[])
    receive_email = BooleanField(gettext('Receive notifications via email'), validators=[])
