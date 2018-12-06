from blinker import Namespace

signals = Namespace()

publish_item = signals.signal('publish-item')
