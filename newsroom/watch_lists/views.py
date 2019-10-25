import flask
from bson import ObjectId
from flask import jsonify
from flask_babel import gettext
from superdesk import get_resource_service
from werkzeug.exceptions import NotFound
from newsroom.auth.views import is_current_user_admin, is_current_user
from newsroom.decorator import admin_only, login_required
from newsroom.watch_lists import blueprint
from .forms import WatchListsForm
from newsroom.utils import query_resource, find_one, get_items_by_id


def get_settings_data():
    return {"companies": list(query_resource('companies'))}


@blueprint.route('/watch_lists/<id>/users', methods=['POST'])
@admin_only
def update_users(id):
    updates = flask.request.get_json()
    if 'users' in updates:
        updates['users'] = [ObjectId(u_id) for u_id in updates['users']]
        get_resource_service('watch_lists').patch(id=ObjectId(id), updates=updates)
        return jsonify({'success': True}), 200


@blueprint.route('/watch_lists/companies', methods=['GET'])
@admin_only
def watch_list_companies():
    watch_lists = list(query_resource('watch_lists'))
    companies = get_items_by_id([ObjectId(w['company']) for w in watch_lists], 'companies')
    return jsonify(companies), 200


@blueprint.route('/watch_lists/<id>/schedule', methods=['POST'])
@admin_only
def update_schedule(id):
    updates = flask.request.get_json()
    get_resource_service('watch_lists').patch(id=ObjectId(id), updates=updates)
    return jsonify({'success': True}), 200


@blueprint.route('/watch_lists/search', methods=['GET'])
@admin_only
def search():
    watch_lists = list(query_resource('watch_lists'))
    return jsonify(watch_lists), 200


@blueprint.route('/watch_lists/new', methods=['POST'])
@admin_only
def create():
    form = WatchListsForm()
    if form.validate():
        new_watch_list = form.data
        if form.company.data:
            new_watch_list['company'] = ObjectId(form.company.data)
            company_users = list(query_resource('users', lookup={'company': new_watch_list['company']}))
            new_watch_list['users'] = [ObjectId(u['_id']) for u in company_users]

        ids = get_resource_service('watch_lists').post([new_watch_list])
        return jsonify({
            'success': True,
            '_id': ids[0],
            'users': new_watch_list.get('users')
        }), 201
    return jsonify(form.errors), 400


@blueprint.route('/watch_lists/<_id>', methods=['GET', 'POST'])
@login_required
def edit(_id):
    if not is_current_user_admin() and not is_current_user(_id):
        flask.abort(401)

    watch_list = find_one('watch_lists', _id=ObjectId(_id))
    if not watch_list:
        return NotFound(gettext('Watch List not found'))

    if flask.request.method == 'POST':
        form = WatchListsForm(watch_list=watch_list)
        if form.validate_on_submit():

            updates = form.data
            if form.company.data:
                updates['company'] = ObjectId(form.company.data)

            watch_list = get_resource_service('watch_lists').patch(ObjectId(_id), updates=updates)
            return jsonify({'success': True}), 200
        return jsonify(form.errors), 400
    return jsonify(watch_list), 200
