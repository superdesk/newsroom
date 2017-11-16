from flask_wtf import Form
from flask_babel import gettext
from wtforms.fields import StringField, BooleanField, HiddenField
from wtforms.validators import DataRequired


class CompanyForm(Form):
    class Meta:
        csrf = False

    BooleanField.false_values = {False, 'false', ''}

    id = HiddenField('Id')
    name = StringField(gettext('Company Name'), validators=[DataRequired()])
    url = StringField(gettext('Company Url'), validators=[])
    sd_subscriber_id = StringField(gettext('Superdesk Subscriber Id'), validators=[])
    is_enabled = BooleanField(gettext('Account Enabled'), default=True, validators=[])
    contact_name = StringField(gettext('Contact Name'), validators=[])
    contact_email = StringField(gettext('Email'), validators=[])
    phone = StringField(gettext('Telephone'), validators=[])
    country = StringField(gettext('Country'), validators=[])
