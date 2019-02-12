# -*- coding: utf-8; -*-
#
# This file is part of Superdesk.
#
# Copyright 2013, 2014, 2015, 2016, 2017, 2018 Sourcefabric z.u. and contributors.
#
# For the full copyright and license information, please see the
# AUTHORS and LICENSE files distributed with this source code, or
# at https://www.sourcefabric.org/superdesk/license

from superdesk import get_resource_service
from superdesk.utc import utcnow
from superdesk.celery_task_utils import get_lock_id
from superdesk.lock import lock, unlock, remove_locks
from flask import render_template, current_app as app
from newsroom.settings import get_settings_collection, GENERAL_SETTINGS_LOOKUP
import datetime
import logging

logger = logging.getLogger(__name__)


class CompanyExpiryAlerts():
    def send_alerts(self):
        self.log_msg = 'Company Expiry Alerts: {}'.format(utcnow())
        logger.info('{} Starting to send alerts.'.format(self.log_msg))

        lock_name = get_lock_id('newsroom', 'company_expiry')
        if not lock(lock_name, expire=610):
            logger.error('{} Job already running'.format(self.log_msg))
            return

        try:
            self.worker()
        except Exception as e:
            logger.exception(e)

        unlock(lock_name)
        remove_locks()

        logger.info('{} Completed sending alerts.'.format(self.log_msg))

    def worker(self):
        from newsroom.email import send_email

        # Check if there are any recipients
        general_settings = get_settings_collection().find_one(GENERAL_SETTINGS_LOOKUP)
        if not (general_settings.get('values') or {}).get('company_expiry_alert_recipients'):
            return  # No one to send

        recipients = general_settings['values']['company_expiry_alert_recipients'].split(',')
        expiry_time = (utcnow() + datetime.timedelta(days=7)).replace(hour=0, minute=0, second=0)
        companies_service = get_resource_service('companies')
        cursor = companies_service.find({'expiry_date': {'$lte': expiry_time}})
        if cursor.count() > 0:
            logger.info('{} Sending to following recipients: {}'.format(self.log_msg, recipients))
            template_kwargs = {
                'companies': list(cursor),
                'expiry_date': expiry_time
            }

            with app.mail.connect() as connection:
                send_email(
                    recipients,
                    'Companies expiring within next 7 days ({})'.format(expiry_time.strftime('%Y-%m-%d')),
                    text_body=render_template('company_expiry_email.txt', **template_kwargs),
                    html_body=render_template('company_expiry_email.html', **template_kwargs),
                    connection=connection
                )
