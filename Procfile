web: gunicorn -b 0.0.0.0:$PORT -w 3 app:app
websocket: python -m newsroom.websocket
newsroom: celery -A newsroom.worker.celery -Q newsroom  worker
beat: celery -A newsroom.worker.celery beat --pid=
