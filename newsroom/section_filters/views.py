import re

import flask
from bson import ObjectId
from flask import jsonify, current_app
from flask_babel import gettext
from superdesk import get_resource_service

from newsroom.decorator import admin_only
from newsroom.section_filters import blueprint
from newsroom.utils import get_json_or_400, get_entity_or_404, set_original_creator, set_version_creator
from newsroom.utils import query_resource, clean_section_filter, is_safe_string


def get_settings_data():
    """Get the settings data for section filter

    :param context
    """
    data = {
        'section_filters': [clean_section_filter(filter) for filter in query_resource('section_filters')],
        'sections': current_app.sections,
    }
    return data


@blueprint.route('/section_filters', methods=['GET'])
@admin_only
def index():
    lookup = None
    if flask.request.args.get('q'):
        lookup = flask.request.args.get('q')
    section_filters = [clean_section_filter(filter) for filter in query_resource('section_filters', lookup=lookup)]
    return jsonify(section_filters), 200


@blueprint.route('/section_filters/search', methods=['GET'])
@admin_only
def search():
    lookup = None
    if flask.request.args.get('q'):
        regex = re.compile('.*{}.*'.format(flask.request.args.get('q')), re.IGNORECASE)
        lookup = {'name': regex}
    section_filters = [clean_section_filter(filter) for filter in query_resource('section_filters', lookup=lookup)]
    return jsonify(section_filters), 200


def validate_section_filter(section_filter):
    if not section_filter.get('name'):
        return jsonify({'name': gettext('Name not found')}), 400

    if not is_safe_string(section_filter.get('name')):
        return jsonify({'name': gettext('Illegal Character')}), 400

    if not is_safe_string(section_filter.get('description')):
        return jsonify({'description': gettext('Illegal Character')}), 400

    if not is_safe_string(section_filter.get('sd_product_id')):
        return jsonify({'sd_product_id': gettext('Illegal Character')}), 400

    if not is_safe_string(section_filter.get('query'), allowed_punctuation="~'"):
        return jsonify({'query': gettext('Illegal Character')}), 400


@blueprint.route('/section_filters/new', methods=['POST'])
@admin_only
def create():
    section_filter = get_json_or_400()

    validation = validate_section_filter(section_filter)
    if validation:
        return validation

    section = next((s for s in current_app.sections if s['_id'] == section_filter.get('filter_type')),
                   None)
    if section and section.get('search_type'):
        section_filter['search_type'] = section['search_type']

    set_original_creator(section_filter)
    ids = get_resource_service('section_filters').post([section_filter])
    return jsonify({'success': True, '_id': ids[0]}), 201


@blueprint.route('/section_filters/<id>', methods=['POST'])
@admin_only
def edit(id):
    get_entity_or_404(ObjectId(id), 'section_filters')
    data = get_json_or_400()
    updates = {
        'name': data.get('name'),
        'description': data.get('description'),
        'sd_product_id': data.get('sd_product_id'),
        'query': data.get('query'),
        'is_enabled': data.get('is_enabled'),
        'filter_type': data.get('filter_type', 'wire'),
    }

    validation = validate_section_filter(updates)
    if validation:
        return validation

    set_version_creator(updates)
    get_resource_service('section_filters').patch(id=ObjectId(id), updates=updates)
    return jsonify({'success': True}), 200


@blueprint.route('/section_filters/<id>', methods=['DELETE'])
@admin_only
def delete(id):
    """ Deletes the section_filters by given id """
    get_entity_or_404(ObjectId(id), 'section_filters')
    get_resource_service('section_filters').delete_action({'_id': ObjectId(id)})
    return jsonify({'success': True}), 200
