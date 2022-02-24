from flask_wtf import FlaskForm
from flask_babel import gettext
from wtforms import StringField, HiddenField, BooleanField, TextAreaField
from wtforms import SelectField
from wtforms.validators import DataRequired, Email, Optional
from copy import deepcopy
import re

alert_types = [('full_text', gettext('Full text')), ('linked_text', gettext('Linked extract(s)'))]
format_types = [('monitoring_pdf', gettext('PDF')), ('monitoring_rtf', gettext('RTF')),
                ('monitoring_email', gettext('Email'))]


class MonitoringForm(FlaskForm):
    class Meta:
        csrf = False

    BooleanField.false_values = {False, 'false', ''}

    id = HiddenField('Id')
    name = StringField(gettext('Name'), validators=[DataRequired()])
    subject = StringField(gettext('Subject'))
    description = StringField(gettext('Description'))
    alert_type = SelectField(gettext('Alert Type'), choices=alert_types, default='full_text')
    format_type = SelectField(gettext('Format Type'), choices=format_types, default='monitoring_pdf')
    company = StringField(gettext('Company'), validators=[DataRequired()])
    email = StringField(gettext('Email'), validators=[Optional()], default='')
    is_enabled = BooleanField(gettext('Enabled'), default=True, validators=[])
    always_send = BooleanField(gettext('Always Send'), default=False, validators=[])
    headline_subject = BooleanField(gettext('Use Headline as Subject of emails containing a single item'),
                                    default=False, validators=[])
    query = TextAreaField(gettext('Query'))

    def validate_email(form, field):
        address_list = re.split(r'[, ]*', field.data)
        input_data = deepcopy(field.data)
        for address in address_list:
            v = Email(message=field.gettext('Invalid email address: ') + address)
            field.data = address
            v(form, field)
        field.data = input_data
