from flask_wtf import FlaskForm
from flask_babel import gettext
from wtforms import StringField, HiddenField, BooleanField, TextAreaField
from wtforms import SelectField
from wtforms.validators import DataRequired

alert_types = [('full_text', gettext('Full text')), ('linked_text', gettext('Linked extract(s)'))]
format_types = [('monitoring_pdf', gettext('PDF')), ('monitoring_rtf', gettext('RTF'))]


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
    is_enabled = BooleanField(gettext('Enabled'), default=True, validators=[])
    always_send = BooleanField(gettext('Always Send'), default=False, validators=[])
    query = TextAreaField(gettext('Query'))
