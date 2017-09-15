import os

from newsroom import Newsroom

app = Newsroom(__name__)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', '5050'))
    app.run(debug=True, port=port, threaded=True)
