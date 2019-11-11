import flask
from bson import ObjectId
from flask import jsonify
from flask_babel import gettext
from superdesk import get_resource_service
from werkzeug.exceptions import NotFound
from newsroom.decorator import admin_only, login_required
from newsroom.watch_lists import blueprint
from .forms import WatchListsForm
from newsroom.utils import query_resource, find_one, get_items_by_id, get_entity_or_404
from newsroom.template_filters import is_admin
from newsroom.auth import get_user


def get_settings_data():
    return {"companies": list(query_resource('companies', lookup={'sections.watch_lists': True}))}


def process_form_request(updates, request_updates, form):
    if 'schedule' in request_updates:
        updates['schedule'] = request_updates['schedule']

    if 'users' in request_updates:
        updates['users'] = [ObjectId(u) for u in request_updates['users']]

    if form.company.data:
        updates['company'] = ObjectId(form.company.data)

    if 'keywords' in request_updates:
        updates['keywords'] = request_updates['keywords']


@blueprint.route('/watch_lists/<id>/users', methods=['POST'])
@admin_only
def update_users(id):
    updates = flask.request.get_json()
    if 'users' in updates:
        updates['users'] = [ObjectId(u_id) for u_id in updates['users']]
        get_resource_service('watch_lists').patch(id=ObjectId(id), updates=updates)
        return jsonify({'success': True}), 200


@blueprint.route('/watch_lists/schedule_companies', methods=['GET'])
@admin_only
def watch_list_companies():
    watch_lists = list(query_resource('watch_lists', lookup={'schedule.interval': {'$ne': None}}))
    companies = get_items_by_id([ObjectId(w['company']) for w in watch_lists], 'companies')
    return jsonify(companies), 200


@blueprint.route('/watch_lists/<id>/schedule', methods=['POST'])
@admin_only
def update_schedule(id):
    updates = flask.request.get_json()
    get_resource_service('watch_lists').patch(id=ObjectId(id), updates=updates)
    return jsonify({'success': True}), 200


@blueprint.route('/watch_lists/search', methods=['GET'])
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

        request_updates = flask.request.get_json()
        process_form_request(new_watch_list, request_updates, form)

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
    watch_list = find_one('watch_lists', _id=ObjectId(_id))
    if not watch_list:
        return NotFound(gettext('Watch List not found'))

    if flask.request.method == 'POST':
        form = WatchListsForm(watch_list=watch_list)
        if form.validate_on_submit():
            updates = form.data
            request_updates = flask.request.get_json()

            # If the updates have anything other than 'users', only admin or watch_list_admin can update
            if len(request_updates.keys()) == 1 and 'users' not in request_updates:
                user = get_user()
                if not is_admin(user):
                    return jsonify({'error': 'Bad request'}), 400

                company = get_entity_or_404(watch_list['company'], 'companies')
                if str(user['_id']) != str(company.get('watch_list_administrator')):
                    return jsonify({'error': 'Bad request'}), 400

            process_form_request(updates, request_updates, form)
            get_resource_service('watch_lists').patch(ObjectId(_id), updates=updates)
            return jsonify({'success': True}), 200
        return jsonify(form.errors), 400
    return jsonify(watch_list), 200


@blueprint.route('/watch_lists/<_id>', methods=['DELETE'])
@admin_only
def delete(_id):
    """ Deletes the watch_list by given id """
    get_resource_service('watch_lists').delete_action({'_id': ObjectId(_id)})
    return jsonify({'success': True}), 200
