from superdesk import get_resource_service
from newsroom.notifications import blueprint
from newsroom.auth.decorator import login_required
from flask import jsonify, abort, session


@blueprint.route('/notifications/<id>', methods=['DELETE'])
@login_required
def delete(id):
    """ Deletes the notification by given id """
    if not str(id).startswith(session['user']):
        abort(403)

    get_resource_service('notifications').delete({'_id': id})
    return jsonify({'success': True}), 200
