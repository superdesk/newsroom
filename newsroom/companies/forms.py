from flask_wtf import Form
from wtforms.fields import StringField, BooleanField, HiddenField
from wtforms.validators import DataRequired


class CompanyForm(Form):
    class Meta:
        csrf = False

    BooleanField.false_values = {False, 'false', ''}

    id = HiddenField('Id')
    name = StringField('Company Name', validators=[DataRequired()])
    url = StringField('Company Url', validators=[])
    sd_subscriber_id = StringField('Superdesk Subscriber Id', validators=[])
    is_enabled = BooleanField('Account Enabled', default=True, validators=[])
    contact_name = StringField('Contact Name', validators=[])
    contact_email = StringField('Email', validators=[])
    phone = StringField('Telephone', validators=[])
    country = StringField('Country', validators=[])
