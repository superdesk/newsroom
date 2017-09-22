import os

from newsroom import Newsroom

app = Newsroom(__name__)


if __name__ == '__main__':
    host = '0.0.0.0'
    port = int(os.environ.get('PORT', '5050'))
    app.run(debug=True, host=host, port=port, threaded=True)
