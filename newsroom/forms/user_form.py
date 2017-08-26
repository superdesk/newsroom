from flask_wtf import FlaskForm
from wtforms import StringField, HiddenField, BooleanField, TextAreaField
from wtforms import SelectField
from wtforms.validators import DataRequired, email

class UserForm(FlaskForm):

    user_types = [('administrator', 'Administrator'),
                 ('public', 'Public'),
                 ('internal', 'Internal')]

    id = HiddenField('Id')
    name = StringField('Name', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), email()])
    phone = StringField('Telephone', validators=[DataRequired()])
    user_type = SelectField('User Type', choices=user_types)
    company = StringField('Company', validators=[])
    signup_details = TextAreaField('Sign Up Details', validators=[])
    is_validated = BooleanField('Email validated', validators=[])
    is_enabled = BooleanField('Account enabled', validators=[])
    is_approved = BooleanField('Account approved', validators=[])
