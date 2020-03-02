# -*- coding: utf-8; -*-
#
# This file is part of Superdesk.
#
# Copyright 2013, 2014, 2015, 2016, 2017, 2018 Sourcefabric z.u. and contributors.
#
# For the full copyright and license information, please see the
# AUTHORS and LICENSE files distributed with this source code, or
# at https://www.sourcefabric.org/superdesk/license

from superdesk import get_resource_service, Command
from superdesk.utc import utcnow, utc_to_local, local_to_utc
from superdesk.celery_task_utils import get_lock_id
from superdesk.lock import lock, unlock, remove_locks
from flask import render_template, current_app as app
from flask_babel import gettext
from newsroom.celery_app import celery
from newsroom.settings import get_settings_collection, GENERAL_SETTINGS_LOOKUP
from newsroom.utils import parse_date_str, get_items_by_id, get_entity_or_404
import datetime
import logging
from bson import ObjectId
from eve.utils import ParsedRequest
from .utils import get_monitoring_file, truncate_article_body
import base64

try:
    from urllib.parse import urlparse
except ImportError:
    from urlparse import urlparse

logger = logging.getLogger(__name__)


class MonitoringEmailAlerts(Command):
    def run(self, immediate=False):
        self.log_msg = 'Monitoring Scheduled Alerts: {}'.format(utcnow())
        logger.info('{} Starting to send alerts.'.format(self.log_msg))

        lock_name = get_lock_id('newsroom', 'monitoring_{0}'.format('scheduled' if not immediate else 'immediate'))
        if not lock(lock_name, expire=610):
            logger.error('{} Job already running'.format(self.log_msg))
            return

        try:
            now_local = utc_to_local(app.config['DEFAULT_TIMEZONE'], utcnow())
            app.config['SERVER_NAME'] = urlparse(app.config['CLIENT_URL']).netloc or None
            celery.conf['SERVER_NAME'] = app.config['SERVER_NAME']

            now_to_minute = now_local.replace(second=0, microsecond=0)

            if immediate:
                self.immediate_worker(now_to_minute)
            else:
                self.scheduled_worker(now_to_minute)
        except Exception as e:
            logger.exception(e)

        unlock(lock_name)
        remove_locks()

        logger.info('{} Completed sending Monitoring Scheduled Alerts.'.format(self.log_msg))

    def immediate_worker(self, now):
        last_minute = now - datetime.timedelta(minutes=1)
        self.send_alerts(self.get_immediate_monitoring_list(),
                         local_to_utc(app.config['DEFAULT_TIMEZONE'], last_minute).strftime('%Y-%m-%d'),
                         local_to_utc(app.config['DEFAULT_TIMEZONE'], last_minute).strftime('%H:%M:%S'), now)

    def get_scheduled_monitoring_list(self):
        return list(get_resource_service('monitoring').find(where={'schedule.interval': {'$in': ['one_hour', 'two_hour',
                                                                                                 'four_hour', 'weekly',
                                                                                                 'daily']},
                                                                   'is_enabled': True}))

    def get_immediate_monitoring_list(self):
        return list(
            get_resource_service('monitoring').find(where={'schedule.interval': 'immediate', 'is_enabled': True}))

    def scheduled_worker(self, now):
        monitoring_list = self.get_scheduled_monitoring_list()

        one_hour_ago = now - datetime.timedelta(hours=1)
        two_hours_ago = now - datetime.timedelta(hours=2)
        four_hours_ago = now - datetime.timedelta(hours=4)
        yesterday = now - datetime.timedelta(days=1)
        last_week = now - datetime.timedelta(days=7)

        one_hours_ago_utc = local_to_utc(app.config['DEFAULT_TIMEZONE'], one_hour_ago)
        two_hours_ago_utc = local_to_utc(app.config['DEFAULT_TIMEZONE'], two_hours_ago)
        four_hours_ago_utc = local_to_utc(app.config['DEFAULT_TIMEZONE'], four_hours_ago)
        yesterday_utc = local_to_utc(app.config['DEFAULT_TIMEZONE'], yesterday)
        last_week_utc = local_to_utc(app.config['DEFAULT_TIMEZONE'], last_week)

        alert_monitoring = {
            'one': {
                'w_lists': [],
                'created_from': one_hours_ago_utc.strftime('%Y-%m-%d'),
                'created_from_time': one_hours_ago_utc.strftime('%H:%M:%S')
            },
            'two': {
                'w_lists': [],
                'created_from': two_hours_ago_utc.strftime('%Y-%m-%d'),
                'created_from_time': two_hours_ago_utc.strftime('%H:%M:%S')
            },
            'four': {
                'w_lists': [],
                'created_from': four_hours_ago_utc.strftime('%Y-%m-%d'),
                'created_from_time': four_hours_ago_utc.strftime('%H:%M:%S')
            },
            'daily': {
                'w_lists': [],
                'created_from': yesterday_utc.strftime('%Y-%m-%d'),
                'created_from_time': yesterday_utc.strftime('%H:%M:%S')
            },
            'weekly': {
                'w_lists': [],
                'created_from': last_week_utc.strftime('%Y-%m-%d'),
                'created_from_time': last_week_utc.strftime('%H:%M:%S')
            },
        }

        for m in monitoring_list:
            self.add_to_send_list(alert_monitoring, m, now, one_hour_ago, two_hours_ago, four_hours_ago, yesterday,
                                  last_week)

        for key, value in alert_monitoring.items():
            self.send_alerts(value['w_lists'], value['created_from'], value['created_from_time'], now)

    def is_within_five_minutes(self, new_scheduled_time, now):
        return (new_scheduled_time and (new_scheduled_time - now).total_seconds() < 300)

    def is_past_range(self, last_run_time, upper_range):
        return (not last_run_time or last_run_time < upper_range)

    def add_to_send_list(self, alert_monitoring, profile, now, one_hour_ago, two_hours_ago, four_hours_ago, yesterday,
                         last_week):
        last_run_time = parse_date_str(profile['last_run_time']) if profile.get('last_run_time') else None
        if last_run_time:
            last_run_time = utc_to_local(app.config['DEFAULT_TIMEZONE'], last_run_time)

        # Convert time to current date for range comparision
        if profile['schedule'].get('time'):
            hour_min = profile['schedule']['time'].split(':')
            schedule_today_plus_five_mins = utc_to_local(app.config['DEFAULT_TIMEZONE'], utcnow())
            schedule_today_plus_five_mins = schedule_today_plus_five_mins.replace(hour=int(hour_min[0]),
                                                                                  minute=int(hour_min[1]))
            schedule_today_plus_five_mins = schedule_today_plus_five_mins + datetime.timedelta(minutes=5)

            # Check if the time window is according to schedule
            if (profile['schedule']['interval'] == 'daily'
                and self.is_within_five_minutes(schedule_today_plus_five_mins, now)
                    and self.is_past_range(last_run_time, yesterday)):
                alert_monitoring['daily']['w_lists'].append(profile)
                return

            # Check if the time window is according to schedule
            # Check if 'day' is according to schedule
            if (profile['schedule']['interval'] == 'weekly'
                and self.is_within_five_minutes(schedule_today_plus_five_mins, now)
                and schedule_today_plus_five_mins.strftime('%a').lower() == profile['schedule']['day']
                    and self.is_past_range(last_run_time, last_week)):
                alert_monitoring['weekly']['w_lists'].append(profile)
                return
        else:
            # Check if current time is within 'hourly' window
            if now.minute > 4:
                return

            if profile['schedule']['interval'] == 'one_hour' and self.is_past_range(last_run_time, one_hour_ago):
                alert_monitoring['one']['w_lists'].append(profile)
                return

            if profile['schedule']['interval'] == 'two_hour' and now.hour % 2 == 0 and \
                    self.is_past_range(last_run_time, two_hours_ago):
                alert_monitoring['two']['w_lists'].append(profile)
                return

            if profile['schedule']['interval'] == 'four_hour' and now.hour % 4 == 0 and  \
                    self.is_past_range(last_run_time, four_hours_ago):
                alert_monitoring['four']['w_lists'].append(profile)
                return

    def send_alerts(self, monitoring_list, created_from, created_from_time, now):
        general_settings = get_settings_collection().find_one(GENERAL_SETTINGS_LOOKUP)
        error_recipients = []
        if general_settings and general_settings['values'].get('system_alerts_recipients'):
            error_recipients = general_settings['values']['system_alerts_recipients'].split(',')

        from newsroom.email import send_email
        for m in monitoring_list:
            if m.get('users'):
                internal_req = ParsedRequest()
                internal_req.args = {
                    'navigation': str(m['_id']),
                    'created_from': created_from,
                    'created_from_time': created_from_time,
                    'skip_user_validation': True
                }
                items = list(get_resource_service('monitoring_search').get(req=internal_req, lookup=None))
                template_kwargs = {'profile': m}
                if items:
                    company = get_entity_or_404(m['company'], 'companies')
                    try:
                        template_kwargs.update({
                            'items': items,
                            'section': 'wire',
                        })
                        truncate_article_body(items, m)
                        _file = get_monitoring_file(m, items)
                        attachment = base64.b64encode(_file.read())
                        formatter = app.download_formatters[m['format_type']]['formatter']

                        send_email(
                            [u['email'] for u in get_items_by_id([ObjectId(u) for u in m['users']], 'users')],
                            m.get('subject') or m['name'],
                            text_body=render_template('monitoring_email.txt', **template_kwargs),
                            html_body=render_template('monitoring_email.html', **template_kwargs),
                            attachments_info=[{
                                'file': attachment,
                                'file_name': formatter.format_filename(None),
                                'content_type': 'application/{}'.format(formatter.FILE_EXTENSION),
                                'file_desc': 'Monitoring Report for Celery monitoring alerts for profile: {}'.format(
                                        m['name'])
                            }]
                        )
                    except Exception:
                        logger.exception('{0} Error processing monitoring profile {1} for company {2}.'.format(
                            self.log_msg, m['name'], company['name']))
                        if error_recipients:
                            # Send an email to admin
                            template_kwargs = {
                                'name': m['name'],
                                'company': company['name'],
                                'run_time': now,
                            }
                            send_email(
                                error_recipients,
                                gettext('Error sending alerts for monitoring: {0}'.format(m['name'])),
                                text_body=render_template('monitoring_error.txt', **template_kwargs),
                                html_body=render_template('monitoring_error.html', **template_kwargs),
                            )
                elif m['schedule'].get('interval') != 'immediate' and m.get('always_send'):
                    send_email(
                        [u['email'] for u in get_items_by_id([ObjectId(u) for u in m['users']], 'users')],
                        m.get('subject') or m['name'],
                        text_body=render_template('monitoring_email_no_updates.txt', **template_kwargs),
                        html_body=render_template('monitoring_email_no_updates.html', **template_kwargs),
                    )

            get_resource_service('monitoring').patch(m['_id'], {
                'last_run_time': local_to_utc(app.config['DEFAULT_TIMEZONE'], now)})


@celery.task(soft_time_limit=600)
def monitoring_schedule_alerts():
    MonitoringEmailAlerts().run()


@celery.task(soft_time_limit=600)
def monitoring_immediate_alerts():
    MonitoringEmailAlerts().run(True)
