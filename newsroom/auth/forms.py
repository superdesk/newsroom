from flask_wtf import FlaskForm, RecaptchaField
from wtforms import StringField, PasswordField, SelectField
from wtforms.validators import DataRequired, Email, Length, EqualTo


class SignupForm(FlaskForm):
    company_sizes = [('0-10', '0-10'), ('11-100', '11-100'), ('>100', '>100')]
    occupations = [('Editor', 'Editor'),
                   ('Journalist', 'Journalist'),
                   ('Sales', 'Sales'),
                   ('CTO', 'CTO'),
                   ('CEO', 'CEO'),
                   ('Other', 'Other')]

    email = StringField('Your email', validators=[DataRequired(), Length(1, 128), Email()])
    first_name = StringField('Your First Name', validators=[DataRequired(), Length(1, 128)])
    last_name = StringField('Your Last Name', validators=[DataRequired(), Length(1, 128)])
    phone = StringField('Your telephone number', validators=[DataRequired()])
    company = StringField('Your company', validators=[DataRequired()])
    country = StringField('Your country', validators=[DataRequired()])
    occupation = SelectField('Your position', choices=occupations, validators=[DataRequired()])
    company_size = SelectField('Size of your company', choices=company_sizes, validators=[DataRequired()])
    recaptcha = RecaptchaField()


class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Length(1, 64), Email()])
    password = PasswordField('Password', validators=[DataRequired()])


class TokenForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Length(1, 64), Email()])


class ResetPasswordForm(FlaskForm):
    old_password = PasswordField('Old password', validators=[])
    new_password = PasswordField('New password', validators=[DataRequired(),
                                                             EqualTo('new_password2', message='Passwords must match.')])
    new_password2 = PasswordField('Confirm new password', validators=[DataRequired()])
