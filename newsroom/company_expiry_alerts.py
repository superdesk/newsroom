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
from flask import render_template
from newsroom.celery_app import celery
from newsroom.settings import get_settings_collection, GENERAL_SETTINGS_LOOKUP
from superdesk import config
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
        try:
            recipients = general_settings['values']['company_expiry_alert_recipients'].split(',')
        except KeyError:
            logger.warning('there are no alert expiry recipients')
            return
        expiry_time = (utcnow() + datetime.timedelta(days=7)).replace(hour=0, minute=0, second=0)
        companies_service = get_resource_service('companies')
        companies = list(companies_service.find({
                'expiry_date': {'$lte': expiry_time},
                'is_enabled': True
                }))

        if len(companies) > 0:
            # Send notifications to users who are nominated to receive expiry alerts
            for company in companies:
                users = get_resource_service('users').find({'company': company.get(config.ID_FIELD),
                                                            'expiry_alert': True})
                if users.count() > 0:
                    template_kwargs = {'expiry_date': company.get('expiry_date')}
                    logger.info('{} Sending to following users of company {}: {}'
                                .format(self.log_msg, company.get('name'), recipients))
                    send_email(
                        [u['email'] for u in users],
                        'Your Company\'s account is expiring on {}'.format(
                            company.get('expiry_date').strftime('%d-%m-%Y')
                        ),
                        text_body=render_template('company_expiry_alert_user.txt', **template_kwargs),
                        html_body=render_template('company_expiry_alert_user.html', **template_kwargs),
                    )

            if not (general_settings.get('values') or {}).get('company_expiry_alert_recipients'):
                return  # No one else to send

            template_kwargs = {
                'companies': sorted(companies, key=lambda k: k['expiry_date']),
                'expiry_date': expiry_time
            }
            logger.info('{} Sending to following expiry administrators: {}'.format(self.log_msg, recipients))
            send_email(
                recipients,
                'Companies expired or due to expire within the next 7 days ({})'.format(
                    expiry_time.strftime('%d-%m-%Y')
                ),
                text_body=render_template('company_expiry_email.txt', **template_kwargs),
                html_body=render_template('company_expiry_email.html', **template_kwargs),
            )


@celery.task(soft_time_limit=600)
def company_expiry():
    CompanyExpiryAlerts().send_alerts()
