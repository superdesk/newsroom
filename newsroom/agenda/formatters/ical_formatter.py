
import arrow
import icalendar

from flask import url_for
from superdesk.utc import utcnow

from newsroom.agenda.contacts import get_contact_name, get_contact_email

from newsroom.formatter import BaseFormatter


def datetime(value):
    """Make sure dates are datetime instances."""
    return arrow.get(value).datetime


def get_rrule_kwargs(rrule):
    kwargs = {'freq': rrule['frequency']}
    if rrule.get('count'):
        kwargs['count'] = rrule['count']
    if rrule.get('interval'):
        kwargs['interval'] = rrule['interval']
    if rrule.get('until'):
        kwargs['until'] = datetime(rrule['until'])
    return kwargs


def guid(item):
    """Get event item guid."""
    return item.get('guid', item.get('event', {}).get('guid', item.get('_id')))


class iCalFormatter(BaseFormatter):

    VERSION = '2.0'
    PRODID = 'Newshub'
    FILE_EXTENSION = 'ical'
    MIMETYPE = 'text/calendar'

    def format_item(self, item, item_type=None):
        cal = icalendar.Calendar()
        cal['version'] = self.VERSION
        cal['prodid'] = self.PRODID
        cal.add_component(self.format_event(item))
        return cal.to_ical()

    def format_event(self, item):
        event = icalendar.Event()
        event.add('uid', guid(item))
        event.add('dtstamp', utcnow())

        # description
        event.add('summary', item['name'])
        if item.get('definition_long'):
            event.add('description', item['definition_long'])
        if item.get('ednote'):
            event.add('comment', item['ednote'])
        if item.get('priority'):
            event.add('priority', item['priority'])

        # calendar as category
        for calendar in item.get('calendars', []):
            if calendar.get('name'):
                event.add('categories', [calendar['name']])

        # dates
        dates = item.get('dates', {})
        event.add('dtstart', datetime(dates['start']))
        if dates.get('end'):
            event.add('dtend', datetime(dates['end']))
        try:
            rrule = item['event']['dates']['recurring_rule']
            event.add('rrule', get_rrule_kwargs(rrule))
        except KeyError:
            pass

        # attachments
        files = item.get('event', {}).get('files', [])
        for media in files:
            if media.get('media'):
                event.add('attach', url_for('upload.get_upload', media_id=media['media'], _external=True))

        # geo
        if item.get('location'):
            for loc in item['location']:
                if loc.get('name'):
                    event.add('location', loc['name'])
                try:
                    event.add('geo', (loc['location']['lat'], loc['location']['lon']))
                except KeyError:
                    pass

        # links
        for link in item.get('event', {}).get('links', []):
            event.add('url', link)

        # contacts
        try:
            contact_info = item['event']['event_contact_info']
        except KeyError:
            contact_info = []
        for contact in contact_info:
            if contact.get('public'):
                event.add('contact', ', '.join(filter(None, [
                    get_contact_name(contact),
                    contact.get('organisation'),
                    get_contact_email(contact),
                ])))

        return event
