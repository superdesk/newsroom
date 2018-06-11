from newsroom.agenda import blueprint
from eve.methods.get import get_internal
from eve.render import send_response


@blueprint.route('/agenda')
def search():
    response = get_internal('agenda')
    return send_response('wire_search', response)
