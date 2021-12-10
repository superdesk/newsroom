from datetime import datetime
from werkzeug.datastructures import MultiDict
import json
import functools
import re
from dateutil import parser
import pytz
from bson import ObjectId
from flask import current_app as app, g

from superdesk import get_resource_service
from superdesk.utc import utcnow, local_to_utc
from superdesk.errors import SuperdeskApiError

from content_api.items.resource import ItemsResource
from content_api.errors import BadParameterValueError, UnexpectedParameterError

from newsroom.news_api.settings import ELASTIC_DATETIME_FORMAT
from newsroom.news_api.utils import post_api_audit, remove_internal_renditions, check_association_permission
from newsroom.search import BaseSearchService, query_string
from newsroom.products.products import get_products_by_company


class NewsAPINewsService(BaseSearchService):
    # set of parameters that the API will allow.
    allowed_params = {
        'start_date', 'end_date',
        'include_fields', 'exclude_fields',
        'page_size', 'page', 'version', 'where',
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
                              'profile', 'service', 'genre', 'associations'}

    default_fields = {
        '_id', 'uri', 'embargoed', 'pubstatus', 'ednote', 'signal', 'copyrightnotice', 'copyrightholder',
        'versioncreated', 'evolvedfrom'
    }

    # set of fields that will be removed from all responses, we are not currently supporting associations and
    # the products embedded in the items are the superdesk products
    mandatory_exclude_fields = {'_current_version', 'products'}

    section = 'news_api'
    limit_days_setting = 'news_api_time_limit_days'

    def get(self, req, lookup):
        resp = super().get(req, lookup)

        orig_request_params = getattr(req, 'args', MultiDict())

        # Can't get the exclude projection to work do pop the exclude fields here
        exclude_fields = self.mandatory_exclude_fields.union(
            set(orig_request_params.get('exclude_fields').split(','))) if orig_request_params.get(
            'exclude_fields') else self.mandatory_exclude_fields

        for doc in resp.docs:
            for field in exclude_fields:
                doc.pop(field, None)

            if 'associations' in orig_request_params.get('include_fields', ''):
                if not check_association_permission(doc):
                    doc.pop('associations', None)
                else:
                    remove_internal_renditions(doc)

        return resp

    def prefill_search_query(self, search, req=None, lookup=None):
        """ Generate the search query instance

        :param newsroom.search.SearchQuery search: The search query instance
        :param ParsedRequest req: The parsed in request instance from the endpoint
        :param dict lookup: The parsed in lookup dictionary from the endpoint
        """

        self.prefill_search_args(search, req)
        self.prefill_search_lookup(search, lookup)
        self.prefill_search_page(search)
        self.prefill_search_company(search)
        self.prefill_search_section(search)
        self.prefill_search_products(search)
        self.prefill_search_items(search)

    def apply_filters(self, search):
        """ Generate and apply the different search filters

        :param newsroom.search.SearchQuery search: the search query instance
        """

        self.apply_section_filter(search)
        self.apply_company_filter(search)
        self.apply_products_filter(search)
        self.apply_fields_filter(search)
        self.apply_date_filter(search)
        self.apply_request_filter(search)
        self.apply_projections(search)
        self.apply_time_limit_filter(search)

        if len(search.query['bool'].get('should', [])):
            search.query['bool']['minimum_should_match'] = 1

    def prefill_search_company(self, search):
        if hasattr(g, 'user'):
            search.company = get_resource_service('companies').find_one(
                req=None,
                _id=g.user
            )

    def prefill_search_products(self, search):
        """ Prefill the search products

        :param newsroom.search.SearchQuery search: The search query instance
        """

        if search.args.get('products'):
            search.products = list(get_resource_service('products').get(req=None, lookup={
                'is_enabled': True,
                'companies': str(search.company['_id']),
                '_id': {
                    '$in': [
                        ObjectId(pid)
                        for pid in search.args['products'].split(',')
                    ]
                }
            }))
        else:
            search.products = get_products_by_company(
                search.company.get('_id'),
                product_type=search.section
            )

    def prefill_search_args(self, search, req=None):
        """ Prefill the search request args

        :param newsroom.search.SearchQuery search: The search query instance
        :param ParsedRequest req: The passed in request instance
        """

        if req is None:
            search.args = {}
        elif getattr(req.args, 'to_dict', None):
            search.args = req.args.to_dict()
        elif isinstance(req.args, dict):
            search.args = req.args
        else:
            search.args = {}

        search.req = req

        # Validating the supplied arguments here, before we pre-fill other arguments
        self.validate_include_exclude_fields(search)
        self.validate_unknown_params(search, whitelist=self.allowed_params)

    def prefill_search_page(self, search):
        """ Prefill the search page parameters

        :param newsroom.search.SearchQuery search: The search query instance
        :param ParsedRequest req: The parsed in request instance from the endpoint
        """

        try:
            search.args['page'] = int(search.args.get('page') or 1)
        except ValueError:
            raise BadParameterValueError('Page must be a number')

        try:
            search.args['page_size'] = int(search.args.get('page_size') or 25)
        except ValueError:
            raise BadParameterValueError('Page Size must be a number')

        search.args['size'] = search.args['page_size']
        search.args['from'] = (search.args['page'] - 1) * search.args['page_size']

        super().prefill_search_page(search)

        if isinstance(search.args['sort'], str):
            if search.args['sort'] == 'versioncreated:desc':
                search.args['sort'] = [{'versioncreated': 'desc'}]
            elif search.args['sort'] == 'versioncreated:asc':
                search.args['sort'] = [{'versioncreated': 'asc'}]
            elif search.args['sort'] == 'score':
                search.args['sort'] = [{'_score': 'desc'}]
            else:
                raise BadParameterValueError(
                    'Unknown sort option ({name})'.format(
                        name=search.args['sort']
                    )
                )

    def validate_request(self, search):
        """ Validate the request parameters

        :param newsroom.search.SearchQuery search: The search query instance
        """

        if not search.company:
            raise SuperdeskApiError.forbiddenError()

        self.validate_page(search)

    def validate_include_exclude_fields(self, search):
        """ Validate the include/exclude fields param

        :param newsroom.search.SearchQuery search: The search query instance
        """
        if search.args.get('include_fields') \
                and not all(p in [c for c in list(self.allowed_include_fields)]
                            for p in search.args['include_fields'].split(',')):
            raise UnexpectedParameterError(
                'Include fields contains a non-allowed value'
            )
        elif search.args.get('exclude_fields') \
                and not all(p in [c for c in list(self.allowed_exclude_fields)]
                            for p in search.args['exclude_fields'].split(',')):
            raise UnexpectedParameterError(
                'Exclude fields contains a non-allowed value'
            )

    def validate_page(self, search):
        """ Validate the page params

        :param newsroom.search.SearchQuery search: The search query instance
        """
        if search.args['page'] < 1:
            raise BadParameterValueError(
                'Page number must be greater or equal to 1'
            )
        elif search.args['page_size'] > app.config['QUERY_MAX_PAGE_SIZE']:
            raise BadParameterValueError(
                'Requested maximum number of results exceeds {max}'.format(
                    max=app.config['QUERY_MAX_PAGE_SIZE']
                )
            )
        elif (search.args['page'] - 1) * search.args['page_size'] >= 1000:
            # https://www.elastic.co/guide/en/elasticsearch/guide/current/pagination.html#pagination
            raise BadParameterValueError(
                'Page limit exceeded'
            )

    def validate_unknown_params(self, search, whitelist, allow_filtering=True):
        """ Check if the request contains only allowed parameters.

        :param newsroom.search.SearchQuery search: The search query instance
        :param whitelist: iterable containing the names of allowed parameters.
        :param bool allow_filtering: whether or not the filtering parameter is
            allowed (True by default). Used for disallowing it when retrieving
            a single object.

        :raises UnexpectedParameterError:
            * if the request contains a parameter that is not whitelisted
            * if the request contains more than one value for any of the
              parameters
        """

        arg_keys = search.args.keys()

        if not allow_filtering:
            err_msg = ("Filtering{} is not supported when retrieving a "
                       "single object (the \"{param}\" parameter)")

            if 'start_date' in arg_keys:
                desc = err_msg.format(' by date range', param='start_date')
                raise UnexpectedParameterError(desc=desc)

            if 'end_date' in arg_keys:
                desc = err_msg.format(' by date range', param='end_date')
                raise UnexpectedParameterError(desc=desc)

        for param_name in arg_keys:
            if param_name not in whitelist:
                raise UnexpectedParameterError(
                    desc="Unexpected parameter ({})".format(param_name)
                )

            if len(search.req.args.getlist(param_name)) > 1:
                desc = "Multiple values received for parameter ({})"
                raise UnexpectedParameterError(desc=desc.format(param_name))

    def apply_request_filter(self, search):
        """ Generate the filters from request args

        :param newsroom.search.SearchQuery search:  The search query instance
        """

        if search.args.get('q'):
            search.query['bool']['must'].append(
                query_string(
                    search.args['q'],
                    search.args.get('default_operator') or 'AND'
                )
            )

    def apply_date_filter(self, search):
        """ Generate and apply date filters

        :param newsroom.search.SearchQuery search: The search query instance
        """

        start_date, end_date = self._get_date_range(search.args)
        date_filter = self._create_date_range_filter(start_date, end_date)
        if date_filter:
            search.query['bool']['must'].append(date_filter)

    def apply_fields_filter(self, search):
        """ Generate the field filters

        :param newsroom.search.SearchQuery search: The search query instance
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

        filters = []

        if search.args.get('filter'):
            try:
                filters = json.loads(search.args['filter'])
            except Exception:
                raise BadParameterValueError('Bad parameter value for Parameter (filter)')

        for argument_name, field_name in argument_fields.items():
            if argument_name not in search.args or search.args[argument_name] is None:
                continue

            filter_value = search.args[argument_name]

            try:
                filter_value = json.loads(filter_value)
            except Exception:
                pass

            if not filter_value:
                raise BadParameterValueError(
                    "Bad parameter value for Parameter ({})".format(argument_name)
                )

            if not isinstance(filter_value, list):
                filter_value = [filter_value]

            filters.append({'terms': {field_name: filter_value}})

        if filters:
            search.query['bool']['must'].extend(filters)

    def apply_projections(self, search):
        """ Generate and apply projections

        :param newsroom.search.SearchQuery search: The search query instance
        """

        include_fields, exclude_fields = self._get_field_filter_params(search.args)
        projection = self._create_field_filter(include_fields, exclude_fields)
        search.projections = json.dumps(projection)

    def gen_source_from_search(self, search):
        """ Generate the eve source object from the search query instance

        :param newsroom.search.SearchQuery search: The search query instance
        """

        search.args['aggs'] = False
        super().gen_source_from_search(search)

    def get_internal_request(self, search):
        """ Creates an eve internal request object

        :param newsroom.search.SearchQuery search: the search query instance
        :return:
        """

        internal_req = super().get_internal_request(search)

        if search.args.get('df'):
            internal_req['df'] = search.args['df']

        return internal_req

    def _get_field_filter_params(self, request_params):
        """ Extract the list of content fields to keep in or remove from
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

        if request_params.get('include_fields'):
            include_fields = self.default_fields.union(include_fields)
        else:
            include_fields = self.default_fields.union(self.allowed_exclude_fields)

        return include_fields, exclude_fields

    def _create_field_filter(self, include_fields, exclude_fields):
        """ Create an `Eve` projection object that explicitly includes/excludes
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
        """ Create a date object from the given string in ISO 8601 format.

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
        """ Extract the start and end date limits from request parameters.

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
                start_date = self._parse_iso_date(
                    request_params.get('start_date'),
                    request_params.get('timezone')
                )
        except BadParameterValueError:
            raise
        except ValueError:
            raise BadParameterValueError(
                desc=err_msg.format('start_date')) from None

        try:
            if request_params.get('end_date'):
                if re.match(regex, request_params.get('end_date', '')):
                    end_date = request_params.get('end_date')
                    relative_end = True
                else:
                    end_date = self._parse_iso_date(
                        request_params.get('end_date'),
                        request_params.get('timezone')
                    )
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
        """ Create a MongoDB date range query filter from the given dates.

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

        return {
            'range': {
                'versioncreated': {
                    'gte': start_date if isinstance(start_date, str) else self._format_date(start_date),
                    'lte': end_date if isinstance(end_date, str) else self._format_date(end_date)
                }
            }
        }

    @staticmethod
    def _format_date(date):
        return datetime.strftime(date, ELASTIC_DATETIME_FORMAT)

    def on_fetched(self, doc):
        post_api_audit(doc)
