from superdesk.services import BaseService
from content_api.items.resource import ItemsResource
from datetime import datetime
from superdesk import get_resource_service
from copy import deepcopy
from eve.utils import ParsedRequest
from werkzeug.datastructures import MultiDict
from content_api.errors import BadParameterValueError, UnexpectedParameterError
import json
from superdesk.utc import utcnow
from newsroom.news_api.settings import ELASTIC_DATETIME_FORMAT, QUERY_MAX_RESULTS
import functools
import re
from dateutil import parser
import pytz
from superdesk.utc import local_to_utc
from bson import ObjectId
from flask import abort


class NewsAPISearchService(BaseService):
    # set of parameters that the API will allow.
    allowed_params = {
        'start_date', 'end_date',
        'include_fields', 'exclude_fields',
        'max_results', 'page', 'version', 'where',
        'q', 'default_operator', 'filter',
        'service', 'subject', 'genre', 'urgency',
        'priority', 'type', 'item_source', 'sort', 'timezone', 'products'
    }

    default_sort = [{'versioncreated': 'desc'}]

    # set of fields that are allowed to be excluded in the exlude_fields parameter
    allowed_exclude_fields = {'version', 'versioncreated', 'firstcreated', 'headline', 'byline', 'slugline'}

    # set of fields that can be specified in the include_fields parameter
    allowed_include_fields = {'type', 'urgency', 'priority', 'language', 'description_html', 'located', 'keywords',
                              'source', 'subject', 'place', 'wordcount', 'charcount', 'body_html', 'readtime',
                              'profile', 'service', 'genre'}

    # set of fields that will be removed from all responses, we are not currently supporting associations and
    # the products embedded in the items are the superdesk products
    mandatory_exclude_fields = {'associations', '_current_version', 'products'}

    def _check_for_unknown_params(
        self, request, whitelist, allow_filtering=True
    ):
        """Check if the request contains only allowed parameters.

        :param req: object representing the HTTP request
        :type req: `eve.utils.ParsedRequest`
        :param whitelist: iterable containing the names of allowed parameters.
        :param bool allow_filtering: whether or not the filtering parameter is
            allowed (True by default). Used for disallowing it when retrieving
            a single object.

        :raises UnexpectedParameterError:
            * if the request contains a parameter that is not whitelisted
            * if the request contains more than one value for any of the
              parameters
        """
        if not request or not getattr(request, 'args'):
            return
        request_params = request.args or MultiDict()

        if not allow_filtering:
            err_msg = ("Filtering{} is not supported when retrieving a "
                       "single object (the \"{param}\" parameter)")

            if 'start_date' in request_params.keys():
                desc = err_msg.format(' by date range', param='start_date')
                raise UnexpectedParameterError(desc=desc)

            if 'end_date' in request_params.keys():
                desc = err_msg.format(' by date range', param='end_date')
                raise UnexpectedParameterError(desc=desc)

        for param_name in request_params.keys():
            if param_name not in whitelist:
                raise UnexpectedParameterError(
                    desc="Unexpected parameter ({})".format(param_name)
                )

            if len(request_params.getlist(param_name)) > 1:
                desc = "Multiple values received for parameter ({})"
                raise UnexpectedParameterError(desc=desc.format(param_name))

    def _set_search_field(self, internal_request_params, original_request_params):
        if internal_request_params is None:
            internal_request_params = MultiDict()

        for key, value in original_request_params.items():
            if key in {'q', 'default_operator', 'df', 'filter'}:
                internal_request_params[key] = value

    def _set_filter_for_arguments(self, req, orig_request_params):
        """Based on arguments creates elastic search filters and
        assign to `filter` argument of the `req` object.

        :param req: object representing the HTTP request
        :type req: `eve.utils.ParsedRequest`
        :param dict orig_request_params: request parameter names and their
            corresponding values
        """
        # request argments and elasticsearch fields
        argument_fields = {
            'service': 'service.code',
            'subject': 'subject.code',
            'urgency': 'urgency',
            'priority': 'priority',
            'genre': 'genre.code',
            'item_source': 'source'
        }

        try:
            filters = json.loads(orig_request_params.get('filter')) \
                if orig_request_params and orig_request_params.get('filter') else []
        except Exception:
            raise BadParameterValueError("Bad parameter value for Parameter (filter)")

        for argument_name, field_name in argument_fields.items():
            if argument_name not in orig_request_params or orig_request_params.get(argument_name) is None:
                continue

            filter_value = orig_request_params.get(argument_name)
            try:
                filter_value = json.loads(orig_request_params.get(argument_name))
            except Exception:
                pass

            if not filter_value:
                raise BadParameterValueError("Bad parameter value for Parameter ({})".format(argument_name))

            if not isinstance(filter_value, list):
                filter_value = [filter_value]

            filters.append({'terms': {field_name: filter_value}})

        if 'products' in orig_request_params:
            try:
                client_product_list = [ObjectId(i) for i in orig_request_params.get('products').split(',')]
            except Exception:
                raise BadParameterValueError("Bad parameter value for ({})".format(orig_request_params.get('products')))

            req.args['requested_products'] = client_product_list

        # set the date range filter
        start_date, end_date = self._get_date_range(orig_request_params)
        date_filter = self._create_date_range_filter(start_date, end_date)
        if date_filter:
            req.args['api_dates'] = date_filter
        if filters:
            req.args['filter'] = json.dumps({'bool': {'must': filters}})

    def _set_fields_filter(self, req):
        """Set content fields filter on the request object (the "projection")
        based on the request parameters.

        It causes some of the content fields to be excluded from the retrieved
        data.

        :param req: object representing the HTTP request
        :type req: `eve.utils.ParsedRequest`
        :param dict original_request_params: request parameter names and their
            corresponding values
        """
        if req.args['include_fields'] \
                and not all(p in [c for c in list(self.allowed_include_fields)]
                            for p in req.args['include_fields'].split(',')):
            abort(400, "Include fields contained a none allowed value")
        elif req.args['exclude_fields'] \
                and not all(p in [c for c in list(self.allowed_exclude_fields)]
                            for p in req.args['exclude_fields'].split(',')):
            abort(400, "Exclude fields contained a none allowed value")

        request_params = req.args or {}

        include_fields, exclude_fields = self._get_field_filter_params(request_params)
        projection = self._create_field_filter(include_fields, exclude_fields)

        req.projection = json.dumps(projection)

    def _get_field_filter_params(self, request_params):
        """Extract the list of content fields to keep in or remove from
        the response.

        The parameter names are `include_fields` and `exclude_fields`. Both are
        simple comma-separated lists, for example::

            exclude_fields=  field_1, field_2,field_3,, ,field_4,

        NOTE: any redundant spaces, empty field values and duplicate values are
        gracefully ignored and do not cause an error.

        :param dict request_params: request parameter names and their
            corresponding values

        :return: a (include_fields, exclude_fields) tuple with each item being
            either a `set` of field names (as strings) or None if the request
            does not contain the corresponding parameter

        :raises BadParameterValueError:
            * if the request contains both parameters at the same time
            * if any of the parameters contain an unknown field name (i.e. not
                defined in the resource schema)
            * if `exclude_params` parameter contains a field name that is
                required to be present in the response according to the NINJS
                standard
        """
        include_fields = request_params.get('include_fields')
        exclude_fields = request_params.get('exclude_fields')

        # parse field filter parameters...
        strip_items = functools.partial(map, lambda s: s.strip())
        remove_empty = functools.partial(filter, None)

        if include_fields is not None:
            include_fields = include_fields.split(',')
            include_fields = set(remove_empty(strip_items(include_fields)))

        if exclude_fields is not None:
            exclude_fields = exclude_fields.split(',')
            exclude_fields = set(remove_empty(strip_items(exclude_fields)))

        # check for semantically incorrect field filter values...
        if (include_fields is not None) and (exclude_fields is not None):
            err_msg = ('Cannot both include and exclude content fields '
                       'at the same time.')
            raise UnexpectedParameterError(desc=err_msg)

        if include_fields is not None:
            err_msg = 'Unknown content field to include ({}).'
            for field in include_fields:
                if field not in ItemsResource.schema:
                    raise BadParameterValueError(desc=err_msg.format(field))

        if exclude_fields is not None:
            if 'uri' in exclude_fields:
                err_msg = ('Cannot exclude a content field required by the '
                           'NINJS format (uri).')
                raise BadParameterValueError(desc=err_msg)

            err_msg = 'Unknown content field to exclude ({}).'
            for field in exclude_fields:
                if field not in ItemsResource.schema:
                    raise BadParameterValueError(desc=err_msg.format(field))

        return include_fields, exclude_fields

    def _create_field_filter(self, include_fields, exclude_fields):
        """Create an `Eve` projection object that explicitly includes/excludes
        particular content fields from results.

        At least one of the parameters *must* be None. The created projection
        uses either a whitlist or a blacklist approach (see below), it cannot
        use both at the same time.

        * If `include_fields` is not None, a blacklist approach is used. All
            fields are _omittted_ from the result, except for those listed in
            the `include_fields` set.
        * If `exclude_fields` is not None, a whitelist approach is used. All
            fields are _included_ in the result, except for those listed in the
            `exclude_fields` set.
        * If both parameters are None, no field filtering should be applied
        and an empty dictionary is returned.

        NOTE: fields required by the NINJS standard are _always_ included in
        the result, regardless of the field filtering parameters.

        :param include_fields: fields to explicitly include in result
        :type include_fields: set of strings or None
        :param exclude_fields: fields to explicitly exclude from result
        :type exclude_fields: set of strings or None

        :return: `Eve` projection filter (as a dictionary)
        """
        projection = {}

        if include_fields is not None:
            for field in include_fields:
                projection[field] = 1
#        elif exclude_fields is not None:
#            for field in exclude_fields:
#                projection[field] = 0

        return projection

    @staticmethod
    def _parse_iso_date(date_str, timezone=None):
        """Create a date object from the given string in ISO 8601 format.

        :param date_str:
        :type date_str: str or None

        :return: resulting date object or None if None is given
        :rtype: datetime.date

        :raises ValueError: if `date_str` is not in the ISO 8601 date format
        """
        if date_str is None:
            return None
        else:
            dt = parser.parse(date_str)
            if dt.tzinfo is None:
                if timezone:
                    if timezone not in pytz.all_timezones:
                        raise BadParameterValueError("Bad parameter value for Parameter (timezone)")
                    dt = local_to_utc(timezone, dt)
                else:
                    dt = pytz.timezone('UTC').localize(dt)
            return dt

    def _get_date_range(self, request_params):
        """Extract the start and end date limits from request parameters.

        If start and/or end date parameter is not present, a default value is
        returned for the missing parameter(s).

        :param dict request_params: request parameter names and their
            corresponding values

        :return: a (start_date, end_date) tuple with both values being
            instances of Python's datetime.date

        :raises BadParameterValueError:
            * if any of the dates is not in the ISO 8601 format
            * if any of the dates is set in the future
            * if the start date is bigger than the end date
        """

        # regex that should match likely relative elastic searcg date math
        regex = r"now([-+][0-9]*([YMwdHhms]*)$|/d$)"

        # check date limits' format...
        err_msg = ("{} parameter must be a valid ISO 8601 date (YYYY-MM-DD) "
                   "with optional the time part")

        relative_start = False
        relative_end = False
        try:
            # check for a relative date
            if re.match(regex, request_params.get('start_date', '')):
                start_date = request_params.get('start_date')
                relative_start = True
            else:
                start_date = self._parse_iso_date(request_params.get('start_date'), request_params.get('timezone'))
        except ValueError:
            raise BadParameterValueError(
                desc=err_msg.format('start_date')) from None

        try:
            if request_params.get('end_date'):
                if re.match(regex, request_params.get('end_date', '')):
                    end_date = request_params.get('end_date')
                    relative_end = True
                else:
                    end_date = self._parse_iso_date(request_params.get('start_date'), request_params.get('timezone'))
            else:
                end_date = None
        except ValueError:
            raise BadParameterValueError(
                desc=err_msg.format('end_date')) from None

        # disallow dates in the future...
        err_msg = (
            "{} date ({}) must not be set in the future "
            "(current server date (UTC): {})")
        today = utcnow()

        if (start_date is not None) and not relative_start and (start_date > today):
            raise BadParameterValueError(
                desc=err_msg.format(
                    'Start', start_date.isoformat(), today.isoformat()
                )
            )

        if (end_date is not None) and not relative_end and (end_date > today):
            raise BadParameterValueError(
                desc=err_msg.format(
                    'End', end_date.isoformat(), today.isoformat()
                )
            )

        # make sure that the date range limits make sense...
        if (
                (not relative_start or not relative_end) and
                (start_date is not None) and (end_date is not None) and
                (start_date > end_date)
        ):
            # NOTE: we allow start_date == end_date (for specific date queries)
            raise BadParameterValueError(
                desc="Start date must not be greater than end date")

        return start_date, end_date

    def _create_date_range_filter(self, start_date, end_date):
        """Create a MongoDB date range query filter from the given dates.

        If both the start date and the end date are None, an empty filter is
        returned. The filtering is performed on the `versioncreated` field in
        database.

        :param start_date: the minimum version creation date (inclusive)
        :type start_date: datetime.date or None
        :param end_date: the maximum version creation date (inclusive)
        :type end_date: datetime.date or None

        :return: MongoDB date range filter (as a dictionary)
        """
        if (start_date is None) and (end_date is None):
            return {}  # nothing to set for the date range filter

        if end_date is None:
            end_date = 'now'

        date_filter = {'range': {'versioncreated': {}}}

        date_filter['range']['versioncreated']['gte'] = start_date if isinstance(start_date,
                                                                                 str) else self._format_date(start_date)
        date_filter['range']['versioncreated']['lte'] = end_date if isinstance(end_date, str) else self._format_date(
            end_date)

        return date_filter

    @staticmethod
    def _format_date(date):
        return datetime.strftime(date, ELASTIC_DATETIME_FORMAT)

    def _set_sort(self, internal_req):
        if not internal_req.sort:
            internal_req.sort = self.default_sort
        if isinstance(internal_req.sort, str):
            if internal_req.sort == 'versioncreated:desc':
                internal_req.sort = [{'versioncreated': 'desc'}]
            elif internal_req.sort == 'versioncreated:asc':
                internal_req.sort = [{'versioncreated': 'asc'}]
            elif internal_req.sort == 'score':
                internal_req.sort = [{'_score': 'desc'}]
            else:
                raise BadParameterValueError('Unkown sort option ({})'.format(internal_req.sort))

    def get(self, req, lookup):
        internal_req = ParsedRequest() if req is None else deepcopy(req)
        internal_req.args = MultiDict()
        orig_request_params = getattr(req, 'args', MultiDict())

        self._check_for_unknown_params(req, whitelist=self.allowed_params)
        self._set_search_field(internal_req.args, orig_request_params)

        # combine elastic search filter for args as args.get('filter')
        self._set_filter_for_arguments(internal_req, orig_request_params)

        # projections
        internal_req.args['exclude_fields'] = orig_request_params.get('exclude_fields')
        internal_req.args['include_fields'] = orig_request_params.get('include_fields')
        self._set_fields_filter(internal_req)  # Eve's "projection"

        # apply default sorting if it was not provided explicitly in query.
        # eve-elastic applies default sorting only if filtering was not provided in query
        # https://github.com/petrjasek/eve-elastic/blob/master/eve_elastic/elastic.py#L455
        self._set_sort(internal_req)

        internal_req.args['section'] = 'news_api'
        internal_req.args.setdefault('from', (req.page - 1) * req.max_results)

        if req.args.get('max_results') and int(req.args.get('max_results')) > QUERY_MAX_RESULTS:
            raise BadParameterValueError('Requested maximum number of results exceeds {}'.format(QUERY_MAX_RESULTS))

        resp = get_resource_service('wire_search').get(internal_req, lookup,
                                                       size=req.args.get('max_results')
                                                       if req.args.get('max_results') else 25, aggs=False)

        # Can't get the exclude projection to work do pop the excude fields here
        exclude_fields = self.mandatory_exclude_fields.union(
            set(orig_request_params.get('exclude_fields').split(','))) if orig_request_params.get(
            'exclude_fields') else self.mandatory_exclude_fields
        for doc in resp.docs:
            for field in exclude_fields:
                doc.pop(field, None)

        return resp
