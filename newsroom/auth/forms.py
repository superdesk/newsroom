from flask_wtf import FlaskForm, RecaptchaField
from flask_babel import gettext
from wtforms import StringField, PasswordField, SelectField, BooleanField
from wtforms.validators import DataRequired, Email, Length, EqualTo


class SignupForm(FlaskForm):
    company_sizes = [('0-10', '0-10'), ('11-100', '11-100'), ('>100', '>100')]
    occupations = [('Editor', gettext('Editor')),
                   ('Journalist', gettext('Journalist')),
                   ('Sales', gettext('Sales')),
                   ('CTO', gettext('CTO')),
                   ('CEO', gettext('CEO')),
                   ('Other', gettext('Other'))]

    email = StringField(gettext('Your email'), validators=[DataRequired(), Length(1, 128), Email()])
    first_name = StringField(gettext('Your First Name'), validators=[DataRequired(), Length(1, 128)])
    last_name = StringField(gettext('Your Last Name'), validators=[DataRequired(), Length(1, 128)])
    phone = StringField(gettext('Your telephone number'), validators=[DataRequired()])
    company = StringField(gettext('Your company'), validators=[DataRequired()])
    country = StringField(gettext('Your country'), validators=[DataRequired()])
    occupation = SelectField(gettext('Your position'), choices=occupations, validators=[DataRequired()])
    company_size = SelectField(gettext('Size of your company'), choices=company_sizes, validators=[DataRequired()])
    recaptcha = RecaptchaField()


class LoginForm(FlaskForm):
    email = StringField(gettext('Email'), validators=[DataRequired(), Length(1, 64), Email()])
    password = PasswordField(gettext('Password'), validators=[DataRequired()])
    remember_me = BooleanField(gettext('Remember Me'), validators=[])


class TokenForm(FlaskForm):
    email = StringField(gettext('Email'), validators=[DataRequired(), Length(1, 64), Email()])


class ResetPasswordForm(FlaskForm):
    match_password2 = [
        DataRequired(),
        Length(min=8),
        EqualTo('new_password2', message=gettext('Passwords must match.'))]
    old_password = PasswordField(gettext('Old password'), validators=[])
    new_password = PasswordField(gettext('New password'), validators=match_password2)
    new_password2 = PasswordField(gettext('Confirm new password'), validators=[DataRequired()])
