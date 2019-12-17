from flask_wtf import FlaskForm
from flask_babel import gettext
from wtforms import StringField, HiddenField, BooleanField, TextAreaField
from wtforms import SelectField
from wtforms.validators import DataRequired


class MonitoringForm(FlaskForm):
    class Meta:
        csrf = False

    BooleanField.false_values = {False, 'false', ''}

    alert_types = [('linked_text', gettext('Linked extract(s)')),
                   ('full_text', gettext('Full text'))]

    id = HiddenField('Id')
    name = StringField(gettext('Name'), validators=[DataRequired()])
    subject = StringField(gettext('Subject'))
    description = StringField(gettext('Description'))
    alert_type = SelectField(gettext('Alert Type'), choices=alert_types, default='full_text')
    company = StringField(gettext('Company'), validators=[DataRequired()])
    is_enabled = BooleanField(gettext('Enabled'), default=True, validators=[])
    query = TextAreaField(gettext('Query'))
