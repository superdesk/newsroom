
import hmac
import flask

from superdesk.notification import push_notification

blueprint = flask.Blueprint('notification', __name__)


def test_signature(request):
    """Test if request is signed using app NOTIFICATION_KEY."""
    payload = request.get_data()
    key = flask.current_app.config['NOTIFICATION_KEY']
    mac = hmac.new(key, payload, 'sha1')
    return hmac.compare_digest(
        request.headers.get('x-superdesk-signature', ''),
        'sha1=%s' % mac.hexdigest()
    )


@blueprint.route('/notify', methods=['POST'])
def notify():
    if not test_signature(flask.request):
        flask.abort(500)
    push_notification('update')
    print(flask.current_app.notification_client.open)
    return flask.jsonify({})
