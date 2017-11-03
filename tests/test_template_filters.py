
from datetime import datetime
from newsroom.template_filters import datetime_long, parse_date


def test_parse_date():
    assert isinstance(parse_date('2017-11-03T13:49:48+0000'), datetime)
    assert isinstance(parse_date(datetime.now().isoformat()), datetime)


def test_datetime_long_str():
    assert isinstance(datetime_long('2017-11-03T13:49:48+0000'), str)
