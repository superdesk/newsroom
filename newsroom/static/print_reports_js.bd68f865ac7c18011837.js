webpackJsonp([11],{

/***/ 178:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.panels = undefined;

var _CompanyProducts = __webpack_require__(179);

var _CompanyProducts2 = _interopRequireDefault(_CompanyProducts);

var _UserSavedSearches = __webpack_require__(180);

var _UserSavedSearches2 = _interopRequireDefault(_UserSavedSearches);

var _CompanySavedSearches = __webpack_require__(181);

var _CompanySavedSearches2 = _interopRequireDefault(_CompanySavedSearches);

var _ProductStories = __webpack_require__(182);

var _ProductStories2 = _interopRequireDefault(_ProductStories);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var panels = exports.panels = {
    'company-saved-searches': _CompanySavedSearches2.default,
    'user-saved-searches': _UserSavedSearches2.default,
    'company-products': _CompanyProducts2.default,
    'product-stories': _ProductStories2.default
};

/***/ }),

/***/ 179:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _utils = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getProductDetails(products) {
    return products.map(function (product) {
        return _react2.default.createElement(
            'div',
            { key: product._id, className: 'd-flex align-items-center m-2' },
            _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                    'span',
                    { className: 'font-italic' },
                    (0, _utils.gettext)('Product name'),
                    ':'
                ),
                ' ',
                product.name
            ),
            _react2.default.createElement(
                'div',
                { className: 'ml-3' },
                _react2.default.createElement(
                    'span',
                    { className: 'font-italic' },
                    (0, _utils.gettext)('Is enabled'),
                    ':'
                ),
                product.is_enabled.toString()
            ),
            product.query && _react2.default.createElement(
                'div',
                { className: 'ml-3' },
                _react2.default.createElement(
                    'span',
                    { className: 'font-italic' },
                    (0, _utils.gettext)('Query'),
                    ':'
                ),
                product.query
            ),
            product.sd_product_id && _react2.default.createElement(
                'div',
                { className: 'ml-3' },
                _react2.default.createElement(
                    'span',
                    { className: 'font-italic' },
                    (0, _utils.gettext)('sd_product_id'),
                    ':'
                ),
                product.sd_product_id
            )
        );
    });
}

function CompanyProducts(_ref) {
    var data = _ref.data;


    var list = data.results && data.results.map(function (item) {
        return [_react2.default.createElement(
            'tr',
            { key: item._id, className: 'table-secondary' },
            _react2.default.createElement(
                'td',
                null,
                item.name
            ),
            _react2.default.createElement(
                'td',
                null,
                item.is_enabled.toString()
            ),
            _react2.default.createElement(
                'td',
                null,
                item.products.length
            )
        ), _react2.default.createElement(
            'tr',
            { key: item._id + '-products' },
            _react2.default.createElement(
                'td',
                { colSpan: '3' },
                getProductDetails(item.products)
            )
        )];
    });

    return _react2.default.createElement(
        'section',
        { className: 'content-main' },
        _react2.default.createElement(
            'div',
            { className: 'list-items-container' },
            data.results && _react2.default.createElement(
                'table',
                { className: 'table table-bordered' },
                _react2.default.createElement(
                    'thead',
                    { className: 'thead-dark' },
                    _react2.default.createElement(
                        'tr',
                        null,
                        _react2.default.createElement(
                            'th',
                            null,
                            (0, _utils.gettext)('Company')
                        ),
                        _react2.default.createElement(
                            'th',
                            null,
                            (0, _utils.gettext)('Is Enabled')
                        ),
                        _react2.default.createElement(
                            'th',
                            null,
                            (0, _utils.gettext)('Number Of Products')
                        )
                    )
                ),
                _react2.default.createElement(
                    'tbody',
                    null,
                    list
                )
            )
        )
    );
}

CompanyProducts.propTypes = {
    data: _propTypes2.default.object.isRequired
};

exports.default = CompanyProducts;

/***/ }),

/***/ 180:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _utils = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function UserSavedSearches(_ref) {
    var data = _ref.data;

    var list = data.results && data.results.map(function (item) {
        return _react2.default.createElement(
            'tr',
            { key: item._id },
            _react2.default.createElement(
                'td',
                null,
                item.name
            ),
            _react2.default.createElement(
                'td',
                null,
                item.is_enabled.toString()
            ),
            _react2.default.createElement(
                'td',
                null,
                item.company
            ),
            _react2.default.createElement(
                'td',
                null,
                item.topic_count
            )
        );
    });

    return _react2.default.createElement(
        'section',
        { className: 'content-main' },
        _react2.default.createElement(
            'div',
            { className: 'list-items-container' },
            data.results && _react2.default.createElement(
                'table',
                { className: 'table table-bordered' },
                _react2.default.createElement(
                    'thead',
                    { className: 'thead-light' },
                    _react2.default.createElement(
                        'tr',
                        null,
                        _react2.default.createElement(
                            'th',
                            null,
                            (0, _utils.gettext)('User')
                        ),
                        _react2.default.createElement(
                            'th',
                            null,
                            (0, _utils.gettext)('Is Enabled')
                        ),
                        _react2.default.createElement(
                            'th',
                            null,
                            (0, _utils.gettext)('Company')
                        ),
                        _react2.default.createElement(
                            'th',
                            null,
                            (0, _utils.gettext)('Number Of Saved Searches')
                        )
                    )
                ),
                _react2.default.createElement(
                    'tbody',
                    null,
                    list
                )
            )
        )
    );
}

UserSavedSearches.propTypes = {
    data: _propTypes2.default.object.isRequired
};

exports.default = UserSavedSearches;

/***/ }),

/***/ 181:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _utils = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function CompanySavedSearches(_ref) {
    var data = _ref.data;

    var list = data.results && data.results.map(function (item) {
        return _react2.default.createElement(
            'tr',
            { key: item._id },
            _react2.default.createElement(
                'td',
                null,
                item.name
            ),
            _react2.default.createElement(
                'td',
                null,
                item.is_enabled.toString()
            ),
            _react2.default.createElement(
                'td',
                null,
                item.topic_count
            )
        );
    });

    return _react2.default.createElement(
        'section',
        { className: 'content-main' },
        _react2.default.createElement(
            'div',
            { className: 'list-items-container' },
            data.results && _react2.default.createElement(
                'table',
                { className: 'table table-bordered' },
                _react2.default.createElement(
                    'thead',
                    { className: 'thead-light' },
                    _react2.default.createElement(
                        'tr',
                        null,
                        _react2.default.createElement(
                            'th',
                            null,
                            (0, _utils.gettext)('Company')
                        ),
                        _react2.default.createElement(
                            'th',
                            null,
                            (0, _utils.gettext)('Is Enabled')
                        ),
                        _react2.default.createElement(
                            'th',
                            null,
                            (0, _utils.gettext)('Number Of Saved Searches')
                        )
                    )
                ),
                _react2.default.createElement(
                    'tbody',
                    null,
                    list
                )
            )
        )
    );
}

CompanySavedSearches.propTypes = {
    data: _propTypes2.default.object.isRequired
};

exports.default = CompanySavedSearches;

/***/ }),

/***/ 182:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _utils = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ProductStories(_ref) {
    var data = _ref.data;

    var list = data.results && data.results.map(function (item) {
        return _react2.default.createElement(
            'tr',
            { key: item._id },
            _react2.default.createElement(
                'td',
                null,
                item.name
            ),
            _react2.default.createElement(
                'td',
                null,
                item.is_enabled.toString()
            ),
            _react2.default.createElement(
                'td',
                null,
                item.today
            ),
            _react2.default.createElement(
                'td',
                null,
                item.last_24_hours
            ),
            _react2.default.createElement(
                'td',
                null,
                item.this_week
            ),
            _react2.default.createElement(
                'td',
                null,
                item.last_7_days
            ),
            _react2.default.createElement(
                'td',
                null,
                item.this_month
            ),
            _react2.default.createElement(
                'td',
                null,
                item.previous_month
            ),
            _react2.default.createElement(
                'td',
                null,
                item.last_6_months
            )
        );
    });

    return _react2.default.createElement(
        'section',
        { className: 'content-main' },
        _react2.default.createElement(
            'div',
            { className: 'list-items-container' },
            data.results && _react2.default.createElement(
                'table',
                { className: 'table table-bordered' },
                _react2.default.createElement(
                    'thead',
                    { className: 'thead-light' },
                    _react2.default.createElement(
                        'tr',
                        null,
                        _react2.default.createElement(
                            'th',
                            null,
                            (0, _utils.gettext)('Product')
                        ),
                        _react2.default.createElement(
                            'th',
                            null,
                            (0, _utils.gettext)('Is Enabled')
                        ),
                        _react2.default.createElement(
                            'th',
                            null,
                            (0, _utils.gettext)('Today')
                        ),
                        _react2.default.createElement(
                            'th',
                            null,
                            (0, _utils.gettext)('Last 24 hours')
                        ),
                        _react2.default.createElement(
                            'th',
                            null,
                            (0, _utils.gettext)('This week')
                        ),
                        _react2.default.createElement(
                            'th',
                            null,
                            (0, _utils.gettext)('Last 7 days')
                        ),
                        _react2.default.createElement(
                            'th',
                            null,
                            (0, _utils.gettext)('This month')
                        ),
                        _react2.default.createElement(
                            'th',
                            null,
                            (0, _utils.gettext)('Previous month')
                        ),
                        _react2.default.createElement(
                            'th',
                            null,
                            (0, _utils.gettext)('Last 6 months')
                        )
                    )
                ),
                _react2.default.createElement(
                    'tbody',
                    null,
                    list
                )
            )
        )
    );
}

ProductStories.propTypes = {
    data: _propTypes2.default.object.isRequired
};

exports.default = ProductStories;

/***/ }),

/***/ 2:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.notify = exports.now = undefined;
exports.createStore = createStore;
exports.render = render;
exports.gettext = gettext;
exports.getProductQuery = getProductQuery;
exports.shortDate = shortDate;
exports.getLocaleDate = getLocaleDate;
exports.fullDate = fullDate;
exports.formatTime = formatTime;
exports.formatDate = formatDate;
exports.getTextFromHtml = getTextFromHtml;
exports.wordCount = wordCount;
exports.toggleValue = toggleValue;
exports.updateRouteParams = updateRouteParams;
exports.formatHTML = formatHTML;
exports.initWebSocket = initWebSocket;
exports.errorHandler = errorHandler;
exports.getConfig = getConfig;
exports.getTimezoneOffset = getTimezoneOffset;
exports.isTouchDevice = isTouchDevice;

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _lodash = __webpack_require__(7);

var _reactRedux = __webpack_require__(6);

var _redux = __webpack_require__(42);

var _reduxLogger = __webpack_require__(47);

var _reduxThunk = __webpack_require__(48);

var _reduxThunk2 = _interopRequireDefault(_reduxThunk);

var _reactDom = __webpack_require__(24);

var _alertifyjs = __webpack_require__(49);

var _alertifyjs2 = _interopRequireDefault(_alertifyjs);

var _moment = __webpack_require__(3);

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var now = exports.now = (0, _moment2.default)(); // to enable mocking in tests
var TIME_FORMAT = getConfig('time_format');
var DATE_FORMAT = getConfig('date_format');
var DATETIME_FORMAT = TIME_FORMAT + ' ' + DATE_FORMAT;

/**
 * Create redux store with default middleware
 *
 * @param {func} reducer
 * @return {Store}
 */
function createStore(reducer) {
    var logger = (0, _reduxLogger.createLogger)({
        duration: true,
        collapsed: true,
        timestamp: false
    });

    return (0, _redux.createStore)(reducer, (0, _redux.applyMiddleware)(_reduxThunk2.default, logger));
}

/**
 * Render helper
 *
 * @param {Store} store
 * @param {Component} App
 * @param {Element} element
 */
function render(store, App, element) {
    return (0, _reactDom.render)(_react2.default.createElement(
        _reactRedux.Provider,
        { store: store },
        _react2.default.createElement(App, null)
    ), element);
}

/**
 * Noop for now, but it's better to use it from beginning.
 *
 * It handles interpolation:
 *
 * gettext('Hello {{ name }}', {name: 'John'});
 *
 * @param {String} text
 * @param {Object} params
 * @return {String}
 */
function gettext(text, params) {
    var translated = text; // temporary

    if (params) {
        Object.keys(params).forEach(function (param) {
            var paramRegexp = new RegExp('{{ ?' + param + ' ?}}', 'g');
            translated = translated.replace(paramRegexp, params[param] || '');
        });
    }

    return translated;
}

/**
 * Returns query string query for a given product
 *
 * @param {Object} product
 * @return {string}
 */
function getProductQuery(product) {
    var q = product.sd_product_id ? 'products.code:' + product.sd_product_id : '';
    q += product.query ? product.sd_product_id ? ' OR (' + product.query + ')' : product.query : '';
    return q;
}

/**
 * Parse given date string and return Date instance
 *
 * @param {String} dateString
 * @return {Date}
 */
function parseDate(dateString) {
    return (0, _moment2.default)(dateString);
}

/**
 * Return date formatted for lists
 *
 * @param {String} dateString
 * @return {String}
 */
function shortDate(dateString) {
    var parsed = parseDate(dateString);
    return parsed.format(isToday(parsed) ? TIME_FORMAT : DATE_FORMAT);
}

/**
 * Return locale date
 *
 * @param {String} dateString
 * @return {String}
 */
function getLocaleDate(dateString) {
    return parseDate(dateString).format(DATETIME_FORMAT);
}

/**
 * Test if given day is today
 *
 * @param {Date} date
 * @return {Boolean}
 */
function isToday(date) {
    return date.format('YYYY-MM-DD') === now.format('YYYY-MM-DD');
}

/**
 * Return full date representation
 *
 * @param {String} dateString
 * @return {String}
 */
function fullDate(dateString) {
    return parseDate(dateString).format(DATETIME_FORMAT);
}

/**
 * Format time of a date
 *
 * @param {String} dateString
 * @return {String}
 */
function formatTime(dateString) {
    return parseDate(dateString).format(TIME_FORMAT);
}

/**
 * Format date of a date (without time)
 *
 * @param {String} dateString
 * @return {String}
 */
function formatDate(dateString) {
    return parseDate(dateString).format(DATE_FORMAT);
}

/**
 * Wrapper for alertifyjs
 */
var notify = exports.notify = {
    success: function success(message) {
        return _alertifyjs2.default.success(message);
    },
    error: function error(message) {
        return _alertifyjs2.default.error(message);
    }
};

/**
 * Get text from html
 *
 * @param {string} html
 * @return {string}
 */
function getTextFromHtml(html) {
    var div = document.createElement('div');
    div.innerHTML = formatHTML(html);
    var tree = document.createTreeWalker(div, NodeFilter.SHOW_TEXT, null, false); // ie requires all params
    var text = [];
    while (tree.nextNode()) {
        text.push(tree.currentNode.textContent);
        if (tree.currentNode.nextSibling) {
            switch (tree.currentNode.nextSibling.nodeName) {
                case 'BR':
                case 'HR':
                    text.push('\n');
            }

            continue;
        }

        switch (tree.currentNode.parentNode.nodeName) {
            case 'P':
            case 'LI':
            case 'H1':
            case 'H2':
            case 'H3':
            case 'H4':
            case 'H5':
            case 'DIV':
            case 'TABLE':
            case 'BLOCKQUOTE':
                text.push('\n');
        }
    }

    return text.join('');
}

/**
 * Get word count for given item
 *
 * @param {Object} item
 * @return {number}
 */
function wordCount(item) {
    if ((0, _lodash.isInteger)(item.word_count)) {
        return item.word_count;
    }

    if (!item.body_html) {
        return 0;
    }

    var text = getTextFromHtml(item.body_html);
    return text.split(' ').filter(function (x) {
        return x.trim();
    }).length || 0;
}

/**
 * Toggle value within array
 *
 * returns a new array so can be used with setState
 *
 * @param {Array} items
 * @param {mixed} value
 * @return {Array}
 */
function toggleValue(items, value) {
    if (!items) {
        return [value];
    }

    var without = items.filter(function (x) {
        return value !== x;
    });
    return without.length === items.length ? without.concat([value]) : without;
}

function updateRouteParams(updates, state) {
    var params = new URLSearchParams(window.location.search);
    var dirty = false;

    Object.keys(updates).forEach(function (key) {
        if (updates[key]) {
            dirty = dirty || updates[key] !== params.get(key);
            params.set(key, updates[key]);
        } else {
            dirty = dirty || params.has(key) || params.entries.length == 0;
            params.delete(key);
        }
    });

    if (dirty) {
        history.pushState(state, null, '?' + params.toString());
    }
}

var SHIFT_OUT_REGEXP = new RegExp(String.fromCharCode(14), 'g');

/**
 * Replace some white characters in html
 *
 * @param {String} html
 * @return {String}
 */
function formatHTML(html) {
    return html.replace(SHIFT_OUT_REGEXP, html.indexOf('<pre>') === -1 ? '<br>' : '\n');
}

/**
 * Initializes the web socket listener
 * @param store
 */
function initWebSocket(store, action) {
    if (window.newsroom) {
        var ws = new WebSocket(window.newsroom.websocket);
        ws.onmessage = function (message) {
            var data = JSON.parse(message.data);
            if (data.event) {
                store.dispatch(action(data));
            }
        };
    }
}

/**
 * Generic error handler for http requests
 * @param error
 * @param dispatch
 * @param setError
 */
function errorHandler(error, dispatch, setError) {
    console.error('error', error);

    if (error.response.status !== 400) {
        notify.error(error.response.statusText);
        return;
    }
    if (setError) {
        error.response.json().then(function (data) {
            dispatch(setError(data));
        });
    }
}

/**
 * Get config value
 *
 * @param {String} key
 * @param {Mixed} defaultValue
 * @return {Mixed}
 */
function getConfig(key, defaultValue) {
    return (0, _lodash.get)(window.newsroom, key, defaultValue);
}

function getTimezoneOffset() {
    return now.utcOffset() ? now.utcOffset() * -1 : 0; // it's oposite to Date.getTimezoneOffset
}

function isTouchDevice() {
    return 'ontouchstart' in window // works on most browsers
    || navigator.maxTouchPoints; // works on IE10/11 and Surface
}

/***/ }),

/***/ 681:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(24);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _utils = __webpack_require__(178);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Panel = _utils.panels[window.report];

_reactDom2.default.render(_react2.default.createElement(Panel, { data: window.reportData }), document.getElementById('print-reports'));

/***/ })

},[681]);