from flask_wtf import Form
from wtforms.fields import StringField, BooleanField, HiddenField
from wtforms.validators import DataRequired


class CompanyForm(Form):
    id = HiddenField('Id')
    name = StringField('Company Name', validators=[DataRequired()])
    sd_subscriber_id = StringField('Superdesk Subscriber Id', validators=[])
    is_enabled = BooleanField('Account Enabled', default=True, validators=[])
    contact_name = StringField('Contact Name', validators=[])
    phone = StringField('Telephone', validators=[])
