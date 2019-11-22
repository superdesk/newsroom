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

logger = logging.getLogger(__name__)


class WatchListEmailAlerts(Command):
    def run(self, immediate=False):
        self.log_msg = 'Watch Lists Scheduled Alerts: {}'.format(utcnow())
        logger.info('{} Starting to send alerts.'.format(self.log_msg))

        lock_name = get_lock_id('newsroom', 'watch_list_{0}'.format('scheduled' if not immediate else 'immediate'))
        if not lock(lock_name, expire=610):
            logger.error('{} Job already running'.format(self.log_msg))
            return

        try:
            now_local = utc_to_local(app.config['DEFAULT_TIMEZONE'], utcnow())
            now_to_minute = now_local.replace(second=0, microsecond=0)

            if immediate:
                self.immediate_worker(now_to_minute)
            else:
                self.scheduled_worker(now_to_minute)
        except Exception as e:
            logger.exception(e)

        unlock(lock_name)
        remove_locks()

        logger.info('{} Completed sending Watch Lists Scheduled Alerts.'.format(self.log_msg))

    def immediate_worker(self, now):
        last_minute = now - datetime.timedelta(minutes=1)
        self.send_alerts(self.get_immediate_watch_lists(),
                         local_to_utc(app.config['DEFAULT_TIMEZONE'], last_minute).strftime('%Y-%m-%d'),
                         local_to_utc(app.config['DEFAULT_TIMEZONE'], last_minute).strftime('%H:%M:%S'), now)

    def get_scheduled_watch_lists(self):
        return list(get_resource_service('watch_lists').find(where={'schedule.interval': {'$in': ['two_hour',
                                                                                                  'four_hour', 'weekly',
                                                                                                  'daily']}}))

    def get_immediate_watch_lists(self):
        return list(
            get_resource_service('watch_lists').find(where={'schedule.interval': 'immediate'}))

    def scheduled_worker(self, now):
        watch_lists = self.get_scheduled_watch_lists()

        two_hours_ago = now - datetime.timedelta(hours=2)
        four_hours_ago = now - datetime.timedelta(hours=4)
        yesterday = now - datetime.timedelta(days=1)
        last_week = now - datetime.timedelta(days=7)

        two_hours_ago_utc = local_to_utc(app.config['DEFAULT_TIMEZONE'], two_hours_ago)
        four_hours_ago_utc = local_to_utc(app.config['DEFAULT_TIMEZONE'], four_hours_ago)
        yesterday_utc = local_to_utc(app.config['DEFAULT_TIMEZONE'], yesterday)
        last_week_utc = local_to_utc(app.config['DEFAULT_TIMEZONE'], last_week)

        alert_watch_list = {
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

        for w in watch_lists:
            self.add_to_send_list(alert_watch_list, w, now, two_hours_ago, four_hours_ago, yesterday, last_week)

        for key, value in alert_watch_list.items():
            self.send_alerts(value['w_lists'], value['created_from'], value['created_from_time'], now)

    def is_within_five_minutes(self, new_scheduled_time, now):
        return (new_scheduled_time and (new_scheduled_time - now).total_seconds() < 300)

    def is_past_range(self, last_run_time, upper_range):
        return (not last_run_time or last_run_time < upper_range)

    def add_to_send_list(self, alert_watch_list, watch_list, now, two_hours_ago, four_hours_ago, yesterday, last_week):
        schedule_today_plus_five_mins = None

        # Convert time to current date for range comparision
        if watch_list['schedule'].get('time'):
            hour_min = watch_list['schedule']['time'].split(':')
            schedule_today_plus_five_mins = utc_to_local(app.config['DEFAULT_TIMEZONE'], utcnow())
            schedule_today_plus_five_mins = schedule_today_plus_five_mins.replace(hour=int(hour_min[0]),
                                                                                  minute=int(hour_min[1]))
            schedule_today_plus_five_mins = schedule_today_plus_five_mins + datetime.timedelta(minutes=5)

        last_run_time = parse_date_str(watch_list['last_run_time']) if watch_list.get('last_run_time') else None
        if last_run_time:
            last_run_time = utc_to_local(app.config['DEFAULT_TIMEZONE'], last_run_time)

        if watch_list['schedule']['interval'] == 'two_hour' and self.is_past_range(last_run_time, two_hours_ago):
            alert_watch_list['two']['w_lists'].append(watch_list)
            return

        if watch_list['schedule']['interval'] == 'four_hour' and self.is_past_range(last_run_time, four_hours_ago):
            alert_watch_list['four']['w_lists'].append(watch_list)
            return

        # Check if the time window is according to schedule
        if (watch_list['schedule']['interval'] == 'daily'
                and self.is_within_five_minutes(schedule_today_plus_five_mins, now)
                and self.is_past_range(last_run_time, yesterday)):
            alert_watch_list['daily']['w_lists'].append(watch_list)
            return

        # Check if the time window is according to schedule
        # Check if 'day' is according to schedule
        if (watch_list['schedule']['interval'] == 'weekly'
                and self.is_within_five_minutes(schedule_today_plus_five_mins, now)
                and schedule_today_plus_five_mins.strftime('%a').lower() == watch_list['schedule']['day']
                and self.is_past_range(last_run_time, last_week)):
            alert_watch_list['weekly']['w_lists'].append(watch_list)

    def send_alerts(self, watch_lists, created_from, created_from_time, now):
        processed_watch_list = []
        general_settings = get_settings_collection().find_one(GENERAL_SETTINGS_LOOKUP)
        error_recipients = []
        if general_settings and general_settings['values'].get('system_alerts_recipients'):
            error_recipients = general_settings['values']['system_alerts_recipients'].split(',')

        for w in watch_lists:
            if w.get('users') and w['_id'] not in processed_watch_list:
                processed_watch_list.append(w['_id'])
                internal_req = ParsedRequest()
                internal_req.args = {
                    'navigation': str(w['_id']),
                    'created_from': created_from,
                    'created_from_time': created_from_time,
                    'celery': True
                }
                items = list(get_resource_service('wire_search').get(req=internal_req, lookup=None))
                if items:
                    company = get_entity_or_404(w['company'], 'companies')
                    try:
                        from newsroom.email import send_email

                        template_kwargs = {
                            'items': items,
                            'section': 'wire',
                        }
                        send_email(
                            [u['email'] for u in get_items_by_id([ObjectId(u) for u in w['users']], 'users')],
                            w.get('subject') or w['name'],
                            text_body=render_template('watch_list_email.txt', **template_kwargs),
                            html_body=render_template('watch_list_email.html', **template_kwargs),
                        )
                    except Exception:
                        logger.exception('{0} Error processing watch list {1} for company {2}.'.format(
                            self.log_msg, w['name'], company['name']))
                        if error_recipients:
                            # Send an email to admin
                            template_kwargs = {
                                'name': w['name'],
                                'company': company['name'],
                                'run_time': now,
                            }
                            send_email(
                                error_recipients,
                                gettext('Error sending alerts for watch_list: {0}'.format(w['name'])),
                                text_body=render_template('watch_list_error.txt', **template_kwargs),
                                html_body=render_template('watch_list_error.html', **template_kwargs),
                            )
                            processed_watch_list.remove(w['_id'])

        for w_id in processed_watch_list:
            get_resource_service('watch_lists').patch(w_id, {
                    'last_run_time': local_to_utc(app.config['DEFAULT_TIMEZONE'], now)})


@celery.task(soft_time_limit=600)
def watch_list_schedule_alerts():
    WatchListEmailAlerts().run()


@celery.task(soft_time_limit=600)
def watch_list_immediate_alerts():
    WatchListEmailAlerts().run(True)
