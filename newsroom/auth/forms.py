from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField
from wtforms import SelectField
from wtforms import ValidationError
from wtforms.validators import DataRequired, Email, Length, EqualTo
from newsroom.utils import query_resource


class SignupForm(FlaskForm):
    company_sizes = [('0-10', '0-10'), ('11-100', '11-100'), ('>100', '>100')]
    occupations = [('Editor', 'Editor'),
                   ('Journalist', 'Journalist'),
                   ('Sales', 'Sales'),
                   ('CTO', 'CTO'),
                   ('CEO', 'CEO'),
                   ('Other', 'Other')]

    email = StringField('Your email', validators=[DataRequired(), Length(1, 128), Email(),
                                                  EqualTo('email2', message='Emails must match.')])
    email2 = StringField('Confirm your email', validators=[DataRequired()])
    name = StringField('Your Name', validators=[DataRequired(), Length(1, 128)])
    password = PasswordField('Password', validators=[DataRequired(),
                                                     EqualTo('password2', message='Passwords must match.')])
    password2 = PasswordField('Confirm your password', validators=[DataRequired()])
    phone = StringField('Your telephone number', validators=[DataRequired()])
    company = StringField('Your company', validators=[DataRequired()])
    country = StringField('Your country', validators=[DataRequired()])
    occupation = SelectField('Your position', choices=occupations, validators=[DataRequired()])
    company_size = SelectField('Size of your company', choices=company_sizes, validators=[DataRequired()])

    def validate_email(self, field):
        existing_users = query_resource('users', {'email': field.data})
        if existing_users.count() > 0:
            raise ValidationError('Email address is already in use')


class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Length(1, 64), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
