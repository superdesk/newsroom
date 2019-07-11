from datetime import timedelta
from newsroom.template_filters import time_short, parse_date, format_datetime
from flask_babel import gettext
from planning.common import WORKFLOW_STATE, ASSIGNMENT_WORKFLOW_STATE

DAY_IN_MINUTES = 24 * 60 - 1


def date_short(datetime):
    if datetime:
        return format_datetime(parse_date(datetime), "dd/MM/yyyy")


def get_agenda_dates(agenda):
    start = agenda.get('dates', {}).get('start')
    end = agenda.get('dates', {}).get('end')

    if start + timedelta(minutes=DAY_IN_MINUTES) < end:
        # Multi day event
        return '{} {} - {} {}'.format(
            time_short(start),
            date_short(start),
            time_short(end),
            date_short(end)
        )

    if start + timedelta(minutes=DAY_IN_MINUTES) == end:
        # All day event
        return '{} {}'.format(gettext('ALL DAY'), date_short(start))

    if start == end:
        # start and end dates are the same
        return '{} {}'.format(time_short(start), date_short(start))

    return '{} - {}, {}'.format(time_short(start), time_short(end), date_short(start))


def get_location_string(agenda):
    location = agenda.get('location', [])

    if not location:
        return ''

    location_items = [
        location[0].get('name'),
        location[0].get('address', {}).get('line', [''])[0],
        location[0].get('address', {}).get('area'),
        location[0].get('address', {}).get('locality'),
        location[0].get('address', {}).get('postal_code'),
        location[0].get('address', {}).get('country'),
    ]

    return ', '.join([l for l in location_items if l])


def get_public_contacts(agenda):
    contacts = agenda.get('event', {}).get('event_contact_info', [])
    public_contacts = []
    for contact in contacts:
        if contact.get('public', False):
            public_contacts.append({
                'name': ' '.join([c for c in [contact.get('first_name'), contact.get('last_name')] if c]),
                'organisation': contact.get('organisation', ''),
                'email': ', '.join(contact.get('contact_email')),
                'phone': ', '.join([c.get('number') for c in contact.get('contact_phone', []) if c.get('public')]),
                'mobile': ', '.join([c.get('number') for c in contact.get('mobile', []) if c.get('public')])
            })
    return public_contacts


def get_links(agenda):
    return agenda.get('event', {}).get('links', [])


def get_latest_available_delivery(coverage):
    return next((d for d in (coverage.get('deliveries') or []) if d.get('delivery_state') == 'published'), None)


def get_coverage_status_text(coverage):
    def get_date(datetime_str):
        return format_datetime(parse_date(datetime_str), 'HH:mm (dd/MM/yyyy)')

    if coverage.get('workflow_status') == WORKFLOW_STATE.CANCELLED:
        return 'has been cancelled.'

    if coverage.get('workflow_status') == WORKFLOW_STATE.DRAFT:
        return 'due at {}.'.format(get_date(coverage.get('scheduled') or
                                            (coverage.get('planning') or {}).get('scheduled')))

    if coverage.get('workflow_status') == ASSIGNMENT_WORKFLOW_STATE.ASSIGNED:
        return 'expected at {}.'.format(get_date(coverage.get('scheduled')))

    if coverage.get('workflow_status') == WORKFLOW_STATE.ACTIVE:
        return 'in progress at {}.'.format(get_date(coverage.get('scheduled')))

    if coverage.get('workflow_status') == ASSIGNMENT_WORKFLOW_STATE.COMPLETED:
        return '{}{}.'.format('updated' if len(coverage.get('deliveries') or []) > 1 else 'available',
                              ' at ' + get_date(coverage.get('publish_time')) if coverage.get('publish_time') else '')


def get_coverage_email_text(coverage, default_state=''):
    content_type = (coverage.get('coverage_type') or
                    coverage.get('planning', {}).get('g2_content_type', '')).capitalize()
    status = default_state or get_coverage_status_text(coverage)
    slugline = (coverage.get('slugline') or coverage.get('planning', {}).get('slugline', ''))

    return '{} coverage \'{}\' {}'.format(content_type, slugline, status)
