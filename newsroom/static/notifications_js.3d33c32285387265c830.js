webpackJsonp([10],{

/***/ 14:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultOptions = {
    credentials: 'same-origin'
};

function options() {
    var custom = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return Object.assign({}, defaultOptions, custom);
}

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response.json();
    } else {
        var error = new Error(response.statusText);
        error.response = response;
        throw error;
    }
}

var Server = function () {
    function Server() {
        _classCallCheck(this, Server);
    }

    _createClass(Server, [{
        key: 'get',

        /**
         * Make GET request
         *
         * @param {String} url
         * @return {Promise}
         */
        value: function get(url) {
            return fetch(url, options({})).then(checkStatus);
        }

        /**
         * Make POST request to url
         *
         * @param {String} url
         * @param {Object} data
         * @return {Promise}
         */

    }, {
        key: 'post',
        value: function post(url, data) {
            return fetch(url, options({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })).then(checkStatus);
        }

        /**
         * Make POST request to url in keeps the format of the input
         *
         * @param {String} url
         * @param {Object} data
         * @return {Promise}
         */

    }, {
        key: 'postFiles',
        value: function postFiles(url, data) {
            return fetch(url, options({
                method: 'POST',
                body: data
            })).then(checkStatus);
        }

        /**
         * Make DELETE request to url
         *
         * @param {String} url
         * @return {Promise}
         */

    }, {
        key: 'del',
        value: function del(url, data) {
            return fetch(url, options({
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: data ? JSON.stringify(data) : null
            })).then(checkStatus);
        }
    }]);

    return Server;
}();

exports.default = new Server();

/***/ }),

/***/ 177:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SET_BOOKMARKS_COUNT = exports.CLEAR_NOTIFICATION = exports.CLEAR_ALL_NOTIFICATIONS = exports.INIT_DATA = exports.NEW_NOTIFICATION = undefined;
exports.newNotification = newNotification;
exports.initData = initData;
exports.clearAllNotifications = clearAllNotifications;
exports.clearNotification = clearNotification;
exports.deleteNotification = deleteNotification;
exports.deleteAllNotifications = deleteAllNotifications;
exports.pushNotification = pushNotification;

var _utils = __webpack_require__(2);

var _server = __webpack_require__(14);

var _server2 = _interopRequireDefault(_server);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NEW_NOTIFICATION = exports.NEW_NOTIFICATION = 'NEW_NOTIFICATION';
function newNotification(notification) {
    return { type: NEW_NOTIFICATION, notification: notification };
}

var INIT_DATA = exports.INIT_DATA = 'INIT_DATA';
function initData(data) {
    return { type: INIT_DATA, data: data };
}

var CLEAR_ALL_NOTIFICATIONS = exports.CLEAR_ALL_NOTIFICATIONS = 'CLEAR_ALL_NOTIFICATIONS';
function clearAllNotifications() {
    return { type: CLEAR_ALL_NOTIFICATIONS };
}

var CLEAR_NOTIFICATION = exports.CLEAR_NOTIFICATION = 'CLEAR_NOTIFICATION';
function clearNotification(id) {
    return { type: CLEAR_NOTIFICATION, id: id };
}

/**
 * Deletes the given notification of the user
 *
 */
function deleteNotification(id) {
    return function (dispatch, getState) {
        var user = getState().user;
        var url = '/users/' + user + '/notifications/' + user + '_' + id;
        return _server2.default.del(url).then(function () {
            _utils.notify.success((0, _utils.gettext)('Notification cleared successfully'));
            dispatch(clearNotification(id));
        }).catch(function (error) {
            return (0, _utils.errorHandler)(error, dispatch);
        });
    };
}

/**
 * Deletes all notifications for the user
 *
 */
function deleteAllNotifications() {
    return function (dispatch, getState) {
        var user = getState().user;
        var url = '/users/' + user + '/notifications';
        return _server2.default.del(url).then(function () {
            _utils.notify.success((0, _utils.gettext)('Notifications cleared successfully'));
            dispatch(clearAllNotifications());
        }).catch(function (error) {
            return (0, _utils.errorHandler)(error, dispatch);
        });
    };
}

/**
 * Handle server push notification
 *
 * @param {Object} data
 */
function pushNotification(push) {
    return function (dispatch, getState) {
        var user = getState().user;
        switch (push.event) {
            case 'history_matches':
                if (push.extra.users && push.extra.users.includes(getState().user)) {
                    return dispatch(newNotification(push.extra));
                }
                break;
            case 'bookmarks:' + user:
                return dispatch(setBookmarksCount(push.extra.count));
        }
    };
}

var SET_BOOKMARKS_COUNT = exports.SET_BOOKMARKS_COUNT = 'SET_BOOKMARKS_COUNT';
function setBookmarksCount(count) {
    return { type: SET_BOOKMARKS_COUNT, count: count };
}

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

/***/ 673:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _utils = __webpack_require__(2);

var _reducers = __webpack_require__(674);

var _reducers2 = _interopRequireDefault(_reducers);

var _NotificationsApp = __webpack_require__(675);

var _NotificationsApp2 = _interopRequireDefault(_NotificationsApp);

var _actions = __webpack_require__(177);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var store = (0, _utils.createStore)(_reducers2.default);

if (window.notificationData) {
    store.dispatch((0, _actions.initData)(window.notificationData));
}

(0, _utils.render)(store, _NotificationsApp2.default, document.getElementById('header-notification'));

(0, _utils.initWebSocket)(store, _actions.pushNotification);

/***/ }),

/***/ 674:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = notificationReducer;

var _actions = __webpack_require__(177);

var initialState = {
    user: null,
    notifications: [],
    bookmarksCount: 0
};

function notificationReducer() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments[1];

    switch (action.type) {

        case _actions.NEW_NOTIFICATION:
            {
                var notifications = state.notifications.concat([action.notification.item]);

                return _extends({}, state, {
                    notifications: notifications
                });
            }

        case _actions.CLEAR_ALL_NOTIFICATIONS:
            return _extends({}, state, {
                notifications: []
            });

        case _actions.CLEAR_NOTIFICATION:
            {
                var _notifications = state.notifications.filter(function (n) {
                    return n._id !== action.id;
                });
                return _extends({}, state, {
                    notifications: _notifications
                });
            }

        case _actions.INIT_DATA:
            {
                return _extends({}, state, {
                    user: action.data.user || null,
                    notifications: action.data.notifications || [],
                    bookmarksCount: action.data.bookmarksCount || 0
                });
            }

        case _actions.SET_BOOKMARKS_COUNT:
            return _extends({}, state, { bookmarksCount: action.count });

        default:
            return state;
    }
}

/***/ }),

/***/ 675:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = __webpack_require__(6);

var _actions = __webpack_require__(177);

var _NotificationList = __webpack_require__(676);

var _NotificationList2 = _interopRequireDefault(_NotificationList);

var _BookmarksCount = __webpack_require__(677);

var _BookmarksCount2 = _interopRequireDefault(_BookmarksCount);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NotificationsApp = function (_React$Component) {
    _inherits(NotificationsApp, _React$Component);

    function NotificationsApp(props, context) {
        _classCallCheck(this, NotificationsApp);

        return _possibleConstructorReturn(this, (NotificationsApp.__proto__ || Object.getPrototypeOf(NotificationsApp)).call(this, props, context));
    }

    _createClass(NotificationsApp, [{
        key: 'render',
        value: function render() {
            return [_react2.default.createElement(_NotificationList2.default, { key: 'notifications',
                notifications: this.props.notifications,
                clearNotification: this.props.clearNotification,
                clearAll: this.props.clearAll
            }), _react2.default.createElement(_BookmarksCount2.default, { key: 'bookmarks', count: this.props.bookmarksCount })];
        }
    }]);

    return NotificationsApp;
}(_react2.default.Component);

NotificationsApp.propTypes = {
    user: _propTypes2.default.string,
    notifications: _propTypes2.default.arrayOf(_propTypes2.default.object),
    clearNotification: _propTypes2.default.func,
    clearAll: _propTypes2.default.func,
    bookmarksCount: _propTypes2.default.number
};

var mapStateToProps = function mapStateToProps(state) {
    return {
        user: state.user,
        notifications: state.notifications,
        bookmarksCount: state.bookmarksCount
    };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
    return {
        clearNotification: function clearNotification(id) {
            return dispatch((0, _actions.deleteNotification)(id));
        },
        clearAll: function clearAll() {
            return dispatch((0, _actions.deleteAllNotifications)());
        }
    };
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(NotificationsApp);

/***/ }),

/***/ 676:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _utils = __webpack_require__(2);

var _CloseButton = __webpack_require__(96);

var _CloseButton2 = _interopRequireDefault(_CloseButton);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NotificationList = function (_React$Component) {
    _inherits(NotificationList, _React$Component);

    function NotificationList(props) {
        _classCallCheck(this, NotificationList);

        var _this = _possibleConstructorReturn(this, (NotificationList.__proto__ || Object.getPrototypeOf(NotificationList)).call(this, props));

        _this.state = { displayItems: false };

        _this.renderNotification = _this.renderNotification.bind(_this);
        _this.toggleDisplay = _this.toggleDisplay.bind(_this);
        return _this;
    }

    _createClass(NotificationList, [{
        key: 'toggleDisplay',
        value: function toggleDisplay() {
            if (!this.state.displayItems && (!this.props.notifications || this.props.notifications.length == 0)) return;
            this.setState({ displayItems: !this.state.displayItems });
            if (!this.state.displayItems) {
                document.getElementById('header-notification').classList.add('notif--open');
            } else {
                document.getElementById('header-notification').classList.remove('notif--open');
            }
        }
    }, {
        key: 'renderNotification',
        value: function renderNotification(newItem) {
            var _this2 = this;

            return _react2.default.createElement(
                'div',
                { key: newItem._id, className: 'notif__list__item' },
                _react2.default.createElement(_CloseButton2.default, { onClick: function onClick() {
                        return _this2.props.clearNotification(newItem._id);
                    } }),
                _react2.default.createElement(
                    'div',
                    { className: 'notif__list__info' },
                    (0, _utils.gettext)('A story you downloaded has been updated')
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'notif__list__headline' },
                    _react2.default.createElement(
                        'a',
                        { href: '/wire?item=' + newItem._id },
                        newItem.headline
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'wire-articles__item__meta-info' },
                    (0, _utils.gettext)('Created on'),
                    ' ',
                    (0, _utils.shortDate)(newItem.versioncreated)
                )
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            return _react2.default.createElement(
                'div',
                { className: 'badge--top-right' },
                this.props.notifications && this.props.notifications.length > 0 && _react2.default.createElement(
                    'div',
                    { className: 'badge badge-pill badge-info badge-secondary' },
                    this.props.notifications && this.props.notifications.length
                ),
                _react2.default.createElement(
                    'span',
                    { className: 'notif__circle' },
                    _react2.default.createElement('i', { className: 'icon--alert icon--white', onClick: this.toggleDisplay })
                ),
                this.state.displayItems && this.props.notifications && this.props.notifications.length > 0 && _react2.default.createElement(
                    'div',
                    { className: 'notif__list' },
                    _react2.default.createElement(
                        'div',
                        { className: 'notif__list__header d-flex' },
                        _react2.default.createElement(
                            'span',
                            { className: 'notif__list__header-headline ml-3' },
                            (0, _utils.gettext)('Notifications')
                        ),
                        _react2.default.createElement(
                            'button',
                            { type: 'button',
                                className: 'button-pill ml-auto mr-3',
                                onClick: this.props.clearAll },
                            (0, _utils.gettext)('Clear All')
                        )
                    ),
                    this.props.notifications.map(function (notification) {
                        return _this3.renderNotification(notification);
                    })
                )
            );
        }
    }]);

    return NotificationList;
}(_react2.default.Component);

NotificationList.propTypes = {
    notifications: _propTypes2.default.array,
    clearNotification: _propTypes2.default.func,
    clearAll: _propTypes2.default.func
};

exports.default = NotificationList;

/***/ }),

/***/ 677:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(24);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function BookmarksCount(_ref) {
    var count = _ref.count;

    return _reactDom2.default.createPortal(_react2.default.createElement(
        'b',
        { className: 'font-weight-normal' },
        count
    ), document.getElementById('bookmarks-count'));
}

BookmarksCount.propTypes = {
    count: _propTypes2.default.number.isRequired
};

exports.default = BookmarksCount;

/***/ }),

/***/ 96:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function CloseButton(_ref) {
    var onClick = _ref.onClick;

    return _react2.default.createElement(
        'button',
        { type: 'button',
            className: 'close',
            'aria-label': 'Close',
            onClick: onClick },
        _react2.default.createElement(
            'span',
            { 'aria-hidden': 'true' },
            '\xD7'
        )
    );
}

CloseButton.propTypes = {
    onClick: _propTypes2.default.func.isRequired
};

exports.default = CloseButton;

/***/ })

},[673]);