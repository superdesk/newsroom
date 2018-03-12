from flask import jsonify, render_template, abort
from flask_babel import gettext

from newsroom.auth.decorator import admin_only
from newsroom.reports import blueprint
from newsroom.reports import reports


@blueprint.route('/reports/print/<report>', methods=['GET'])
@admin_only
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
@admin_only
def company_reports():
    return render_template('company_reports.html', setting_type="company_reports")


@blueprint.route('/reports/<report>', methods=['GET'])
@admin_only
def get_report(report):
    func = reports.get(report)

    if not func:
        abort(400, gettext('Unknown report {}'.format(report)))

    results = func()
    return jsonify(results), 200
