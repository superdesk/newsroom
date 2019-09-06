from flask import jsonify, render_template, abort, current_app as newsroom_app
from flask_babel import gettext

from newsroom.decorator import account_manager_only
from newsroom.reports import blueprint
from newsroom.reports import reports
from newsroom.utils import query_resource


@blueprint.route('/reports/print/<report>', methods=['GET'])
@account_manager_only
def print_reports(report):
    func = reports.get(report)

    if not func:
        abort(400, gettext('Unknown report {}'.format(report)))

    data = func()
    return render_template('reports_print.html',
                           setting_type="print_reports",
                           data=data,
                           report=report)


@blueprint.route('/reports/company_reports', methods=['GET'])
@account_manager_only
def company_reports():
    companies = list(query_resource('companies'))
    data = {
        'companies': companies,
        'sections': newsroom_app.sections
    }
    return render_template('company_reports.html', setting_type="company_reports", data=data)


@blueprint.route('/reports/<report>', methods=['GET'])
@account_manager_only
def get_report(report):
    func = reports.get(report)

    if not func:
        abort(400, gettext('Unknown report {}'.format(report)))

    results = func()
    return jsonify(results), 200


# @blueprint.route('/reports/export/<report>', methods=['GET'])
# @account_manager_only
# def export_reports(report):
    # func = reports.get(report)

    # if not func:
    # abort(400, gettext('Unknown report {}'.format(report)))

    # return func(), 200
