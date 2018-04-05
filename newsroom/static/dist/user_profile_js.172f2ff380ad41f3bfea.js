webpackJsonp([8],{

/***/ 107:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.modalReducer = modalReducer;

var _actions = __webpack_require__(15);

function modalReducer(state, action) {
    switch (action.type) {
        case _actions.RENDER_MODAL:
            return { modal: action.modal, data: action.data };

        case _actions.CLOSE_MODAL:
            return null;

        default:
            return state;
    }
}

/***/ }),

/***/ 108:
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

var _utils = __webpack_require__(2);

var _actions = __webpack_require__(9);

var _actions2 = __webpack_require__(53);

var _Modal = __webpack_require__(75);

var _Modal2 = _interopRequireDefault(_Modal);

var _TextInput = __webpack_require__(25);

var _TextInput2 = _interopRequireDefault(_TextInput);

var _CheckboxInput = __webpack_require__(26);

var _CheckboxInput2 = _interopRequireDefault(_CheckboxInput);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TOPIC_NAME_MAXLENGTH = 30;

var FollowTopicModal = function (_React$Component) {
    _inherits(FollowTopicModal, _React$Component);

    function FollowTopicModal(props) {
        _classCallCheck(this, FollowTopicModal);

        var _this = _possibleConstructorReturn(this, (FollowTopicModal.__proto__ || Object.getPrototypeOf(FollowTopicModal)).call(this, props));

        _this.state = {
            topic: _this.props.data.topic || null
        };

        _this.onSubmit = _this.onSubmit.bind(_this);
        _this.onChangeHandler = _this.onChangeHandler.bind(_this);
        return _this;
    }

    _createClass(FollowTopicModal, [{
        key: 'onSubmit',
        value: function onSubmit(event) {
            event.preventDefault();
            if (this.state.topic.label) {
                this.props.submit(this.isNewTopic(), this.state.topic);
            }
        }
    }, {
        key: 'onChangeHandler',
        value: function onChangeHandler(field) {
            var _this2 = this;

            return function (event) {
                var topic = Object.assign({}, _this2.state.topic, _defineProperty({}, field, event.target.value));
                _this2.setState({ topic: topic });
            };
        }
    }, {
        key: 'toggleNotifications',
        value: function toggleNotifications() {
            var topic = Object.assign(this.state.topic, { notifications: !this.state.topic.notifications });
            this.setState({ topic: topic });
        }
    }, {
        key: 'isNewTopic',
        value: function isNewTopic() {
            return this.state.topic && !this.state.topic._id;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            return _react2.default.createElement(
                _Modal2.default,
                { title: (0, _utils.gettext)('Save as topic'), onSubmit: this.onSubmit },
                _react2.default.createElement(
                    'form',
                    { onSubmit: this.onSubmit },
                    _react2.default.createElement(_TextInput2.default, {
                        label: (0, _utils.gettext)('Name'),
                        required: true,
                        value: this.state.topic.label,
                        onChange: this.onChangeHandler('label'),
                        maxLength: TOPIC_NAME_MAXLENGTH
                    }),
                    _react2.default.createElement(_CheckboxInput2.default, {
                        label: (0, _utils.gettext)('Send me notifications'),
                        value: this.state.topic.notifications || false,
                        onChange: function onChange() {
                            return _this3.toggleNotifications();
                        }
                    })
                )
            );
        }
    }]);

    return FollowTopicModal;
}(_react2.default.Component);

FollowTopicModal.propTypes = {
    submit: _propTypes2.default.func.isRequired,
    data: _propTypes2.default.shape({
        topic: _propTypes2.default.object.isRequired
    })
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
    return {
        submit: function submit(isNew, data) {
            return isNew ? dispatch((0, _actions.submitFollowTopic)(data)) : dispatch((0, _actions2.submitFollowTopic)(data));
        }
    };
};

exports.default = (0, _reactRedux.connect)(null, mapDispatchToProps)(FollowTopicModal);

/***/ }),

/***/ 109:
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

var _utils = __webpack_require__(2);

var _actions = __webpack_require__(9);

var _actions2 = __webpack_require__(53);

var _Modal = __webpack_require__(75);

var _Modal2 = _interopRequireDefault(_Modal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ShareItemModal = function (_React$Component) {
    _inherits(ShareItemModal, _React$Component);

    function ShareItemModal(props) {
        _classCallCheck(this, ShareItemModal);

        var _this = _possibleConstructorReturn(this, (ShareItemModal.__proto__ || Object.getPrototypeOf(ShareItemModal)).call(this, props));

        _this.state = { message: '', users: [], items: _this.props.data.items };
        _this.onSubmit = _this.onSubmit.bind(_this);
        _this.users = _this.props.data.users;
        return _this;
    }

    _createClass(ShareItemModal, [{
        key: 'onSubmit',
        value: function onSubmit(event) {
            event.preventDefault();
            if (this.state.users.length) {
                this.props.submit(this.isFollowedTopic(), this.state);
            }
        }
    }, {
        key: 'onChangeHandler',
        value: function onChangeHandler(field) {
            var _this2 = this;

            return function (event) {
                _this2.setState(_defineProperty({}, field, event.target.value));
            };
        }
    }, {
        key: 'toggleUser',
        value: function toggleUser(userId) {
            this.setState({
                users: (0, _utils.toggleValue)(this.state.users, userId)
            });
        }
    }, {
        key: 'toggleAllUsers',
        value: function toggleAllUsers() {
            this.setState({
                users: this.users.length === this.state.users.length ? [] : this.users.map(function (u) {
                    return u._id;
                })
            });
        }
    }, {
        key: 'isFollowedTopic',
        value: function isFollowedTopic() {
            return !!this.state.items[0].query;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var usersList = this.users.map(function (user) {
                return _react2.default.createElement(
                    'tr',
                    { key: user._id },
                    _react2.default.createElement(
                        'td',
                        null,
                        _react2.default.createElement('input', { id: user._id, type: 'checkbox',
                            checked: _this3.state.users.indexOf(user._id) > -1,
                            onChange: function onChange() {
                                return _this3.toggleUser(user._id);
                            } })
                    ),
                    _react2.default.createElement(
                        'td',
                        null,
                        _react2.default.createElement(
                            'label',
                            { htmlFor: user._id },
                            user.first_name,
                            ' ',
                            ' ',
                            ' ',
                            user.last_name
                        )
                    )
                );
            });

            return _react2.default.createElement(
                _Modal2.default,
                { onSubmit: this.onSubmit, title: (0, _utils.gettext)('Share Item'), onSubmitLabel: (0, _utils.gettext)('Share') },
                _react2.default.createElement(
                    'form',
                    { onSubmit: this.onSubmit },
                    _react2.default.createElement(
                        'div',
                        { className: 'form-group' },
                        _react2.default.createElement(
                            'label',
                            { htmlFor: 'users' },
                            (0, _utils.gettext)('People')
                        ),
                        _react2.default.createElement(
                            'table',
                            { className: 'table' },
                            _react2.default.createElement(
                                'thead',
                                null,
                                _react2.default.createElement(
                                    'tr',
                                    null,
                                    _react2.default.createElement(
                                        'th',
                                        null,
                                        _react2.default.createElement('input', { id: 'check-all', type: 'checkbox',
                                            onChange: function onChange() {
                                                return _this3.toggleAllUsers();
                                            },
                                            checked: this.state.users.length === this.users.length
                                        })
                                    ),
                                    _react2.default.createElement(
                                        'th',
                                        null,
                                        _react2.default.createElement(
                                            'label',
                                            { htmlFor: 'check-all' },
                                            (0, _utils.gettext)('Select All')
                                        )
                                    )
                                )
                            ),
                            _react2.default.createElement(
                                'tbody',
                                null,
                                usersList
                            )
                        )
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'form-group' },
                        _react2.default.createElement(
                            'label',
                            { htmlFor: 'message' },
                            (0, _utils.gettext)('Message')
                        ),
                        _react2.default.createElement('textarea', { className: 'form-control',
                            id: 'message',
                            value: this.state.message,
                            onChange: this.onChangeHandler('message')
                        })
                    )
                )
            );
        }
    }]);

    return ShareItemModal;
}(_react2.default.Component);

ShareItemModal.propTypes = {
    submit: _propTypes2.default.func.isRequired,
    data: _propTypes2.default.shape({
        items: _propTypes2.default.arrayOf(_propTypes2.default.object).isRequired,
        users: _propTypes2.default.arrayOf(_propTypes2.default.shape({
            _id: _propTypes2.default.string.isRequired,
            first_name: _propTypes2.default.string.isRequired,
            last_name: _propTypes2.default.string.isRequired
        }))
    })
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
    return {
        submit: function submit(isFolllowedTopic, data) {
            return isFolllowedTopic ? dispatch((0, _actions2.submitShareTopic)(data)) : dispatch((0, _actions.submitShareItem)(data));
        }
    };
};

exports.default = (0, _reactRedux.connect)(null, mapDispatchToProps)(ShareItemModal);

/***/ }),

/***/ 11:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getReadItems = getReadItems;
exports.markItemAsRead = markItemAsRead;
exports.getNewsOnlyParam = getNewsOnlyParam;
exports.toggleNewsOnlyParam = toggleNewsOnlyParam;
exports.getMaxVersion = getMaxVersion;
exports.getIntVersion = getIntVersion;
exports.getPicture = getPicture;
exports.getThumbnailRendition = getThumbnailRendition;
exports.getPreviewRendition = getPreviewRendition;
exports.getDetailRendition = getDetailRendition;
exports.isKilled = isKilled;
exports.showItemVersions = showItemVersions;
exports.shortText = shortText;
exports.getCaption = getCaption;
exports.getActiveQuery = getActiveQuery;
exports.isTopicActive = isTopicActive;
exports.isEqualItem = isEqualItem;

var _store = __webpack_require__(30);

var _store2 = _interopRequireDefault(_store);

var _localStorage = __webpack_require__(17);

var _localStorage2 = _interopRequireDefault(_localStorage);

var _operations = __webpack_require__(40);

var _operations2 = _interopRequireDefault(_operations);

var _lodash = __webpack_require__(7);

var _utils = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var STATUS_KILLED = 'canceled';
var READ_ITEMS_STORE = 'read_items';
var NEWS_ONLY_STORE = 'news_only';

var store = _store2.default.createStore([_localStorage2.default], [_operations2.default]);

/**
 * Get read items
 *
 * @returns {Object}
 */
function getReadItems() {
    return store.get(READ_ITEMS_STORE);
}

/**
 * Marks the given item as read
 *
 * @param {Object} item
 * @param {Object} state
 */
function markItemAsRead(item, state) {
    if (item && item._id && item.version) {
        store.assign(READ_ITEMS_STORE, _defineProperty({}, item._id, getMaxVersion(state.readItems[item._id], item.version)));
    }
}

/**
 * Get news only value
 *
 * @returns {boolean}
 */
function getNewsOnlyParam() {
    return !!(store.get(NEWS_ONLY_STORE) || {}).value;
}

/**
 * Toggles news only value
 *
 */
function toggleNewsOnlyParam() {
    store.assign(NEWS_ONLY_STORE, { value: !getNewsOnlyParam() });
}

/**
 * Returns the greater version
 *
 * @param versionA
 * @param versionB
 * @returns {number}
 */
function getMaxVersion(versionA, versionB) {
    return Math.max(parseInt(versionA, 10) || 0, parseInt(versionB, 10) || 0);
}

/**
 * Returns the item version as integer
 *
 * @param {Object} item
 * @returns {number}
 */
function getIntVersion(item) {
    if (item) {
        return parseInt(item.version, 10) || 0;
    }
}

/**
 * Get picture for an item
 *
 * if item is picture return it, otherwise look for featuremedia
 *
 * @param {Object} item
 * @return {Object}
 */
function getPicture(item) {
    return item.type === 'picture' ? item : (0, _lodash.get)(item, 'associations.featuremedia');
}

/**
 * Get picture thumbnail rendition specs
 *
 * @param {Object} picture
 * @param {Boolean} large
 * @return {Object}
 */
function getThumbnailRendition(picture, large) {
    var rendition = large ? 'renditions._newsroom_thumbnail_large' : 'renditions._newsroom_thumbnail';
    return (0, _lodash.get)(picture, rendition, (0, _lodash.get)(picture, 'renditions.thumbnail'));
}

/**
 * Get picture preview rendition
 *
 * @param {Object} picture
 * @return {Object}
 */
function getPreviewRendition(picture) {
    return (0, _lodash.get)(picture, 'renditions._newsroom_view', (0, _lodash.get)(picture, 'renditions.viewImage'));
}

/**
 * Get picture detail rendition
 *
 * @param {Object} picture
 * @return {Object}
 */
function getDetailRendition(picture) {
    return (0, _lodash.get)(picture, 'renditions._newsroom_base', (0, _lodash.get)(picture, 'renditions.baseImage'));
}

/**
 * Test if an item is killed
 *
 * @param {Object} item
 * @return {Boolean}
 */
function isKilled(item) {
    return item.pubstatus === STATUS_KILLED;
}

/**
 * Test if other item versions should be visible
 *
 * @param {Object} item
 * @param {bool} next toggle if checking for next or previous versions
 * @return {Boolean}
 */
function showItemVersions(item, next) {
    return !isKilled(item) && (next || item.ancestors && item.ancestors.length);
}

/**
 * Get short text for lists
 *
 * @param {Item} item
 * @return {Node}
 */
function shortText(item) {
    var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 40;

    var html = item.description_html || item.body_html || '<p></p>';
    var text = item.description_text || (0, _utils.getTextFromHtml)(html);
    var words = text.split(/\s/).filter(function (w) {
        return w;
    });
    return words.slice(0, length).join(' ') + (words.length > length ? '...' : '');
}

/**
 * Get caption for picture
 *
 * @param {Object} picture
 * @return {String}
 */
function getCaption(picture) {
    return (0, _utils.getTextFromHtml)(picture.body_text || picture.description_text || '').trim();
}

function getActiveQuery(query, activeFilter, createdFilter) {
    var queryParams = {
        query: query || null,
        filter: (0, _lodash.pickBy)(activeFilter),
        created: (0, _lodash.pickBy)(createdFilter)
    };

    return (0, _lodash.pickBy)(queryParams, function (val) {
        return !(0, _lodash.isEmpty)(val);
    });
}

function isTopicActive(topic, activeQuery) {
    var topicQuery = getActiveQuery(topic.query, topic.filter, topic.created);
    return !(0, _lodash.isEmpty)(activeQuery) && (0, _lodash.isEqual)(topicQuery, activeQuery);
}

/**
 * Test if 2 items are equal
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Boolean}
 */
function isEqualItem(a, b) {
    return a && b && a._id === b._id && a.version === b.version;
}

/***/ }),

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

/***/ 15:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.renderModal = renderModal;
exports.closeModal = closeModal;
var RENDER_MODAL = exports.RENDER_MODAL = 'RENDER_MODAL';
function renderModal(modal, data) {
    return { type: RENDER_MODAL, modal: modal, data: data };
}

var CLOSE_MODAL = exports.CLOSE_MODAL = 'CLOSE_MODAL';
function closeModal() {
    return { type: CLOSE_MODAL };
}

/***/ }),

/***/ 17:
/***/ (function(module, exports, __webpack_require__) {

var util = __webpack_require__(5)
var Global = util.Global

module.exports = {
	name: 'localStorage',
	read: read,
	write: write,
	each: each,
	remove: remove,
	clearAll: clearAll,
}

function localStorage() {
	return Global.localStorage
}

function read(key) {
	return localStorage().getItem(key)
}

function write(key, data) {
	return localStorage().setItem(key, data)
}

function each(fn) {
	for (var i = localStorage().length - 1; i >= 0; i--) {
		var key = localStorage().key(i)
		fn(read(key), key)
	}
}

function remove(key) {
	return localStorage().removeItem(key)
}

function clearAll() {
	return localStorage().clear()
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

/***/ 25:
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

function TextInput(_ref) {
    var type = _ref.type,
        name = _ref.name,
        label = _ref.label,
        onChange = _ref.onChange,
        value = _ref.value,
        error = _ref.error,
        required = _ref.required,
        readOnly = _ref.readOnly,
        maxLength = _ref.maxLength;

    var wrapperClass = 'form-group';

    if (error && error.length > 0) {
        wrapperClass += ' has-error';
    }

    if (!name) {
        name = 'input-' + label;
    }

    return _react2.default.createElement(
        'div',
        { className: wrapperClass },
        _react2.default.createElement(
            'label',
            { htmlFor: name },
            label
        ),
        _react2.default.createElement(
            'div',
            { className: 'field' },
            _react2.default.createElement('input', {
                type: type || 'text',
                id: name,
                name: name,
                className: 'form-control',
                value: value,
                onChange: onChange,
                required: required,
                maxLength: maxLength,
                readOnly: readOnly
            }),
            error && _react2.default.createElement(
                'div',
                { className: 'alert alert-danger' },
                error
            )
        )
    );
}

TextInput.propTypes = {
    type: _propTypes2.default.string,
    label: _propTypes2.default.string.isRequired,
    name: _propTypes2.default.string,
    value: _propTypes2.default.string,
    error: _propTypes2.default.arrayOf(_propTypes2.default.string),
    onChange: _propTypes2.default.func,
    required: _propTypes2.default.bool,
    readOnly: _propTypes2.default.bool,
    maxLength: _propTypes2.default.number
};

exports.default = TextInput;

/***/ }),

/***/ 26:
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

function CheckboxInput(_ref) {
    var name = _ref.name,
        label = _ref.label,
        onChange = _ref.onChange,
        value = _ref.value;

    if (!name) {
        name = 'input-' + label;
    }

    return _react2.default.createElement(
        'div',
        { className: 'form-check p-0' },
        _react2.default.createElement(
            'div',
            { className: 'custom-control custom-checkbox' },
            _react2.default.createElement('input', { type: 'checkbox',
                name: name,
                className: 'custom-control-input',
                checked: value,
                id: name,
                onChange: onChange }),
            _react2.default.createElement(
                'label',
                { className: 'custom-control-label', htmlFor: name },
                label
            )
        )
    );
}

CheckboxInput.propTypes = {
    name: _propTypes2.default.string,
    label: _propTypes2.default.string.isRequired,
    onChange: _propTypes2.default.func.isRequired,
    value: _propTypes2.default.bool.isRequired
};

exports.default = CheckboxInput;

/***/ }),

/***/ 28:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = __webpack_require__(7);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Analytics = function () {
    function Analytics() {
        _classCallCheck(this, Analytics);
    }

    _createClass(Analytics, [{
        key: '_event',
        value: function _event(name, params) {
            if (window.gtag) {
                var company = (0, _lodash.get)(window, 'profileData.companyName', 'none');
                var user = (0, _lodash.get)(window, 'profileData.user.first_name', 'unknown');
                var userParams = {
                    event_category: company,
                    company: company,
                    user: user
                };

                window.gtag('event', name, Object.assign(userParams, params));
            }
        }
    }, {
        key: 'event',
        value: function event(name, label, params) {
            this._event(name, Object.assign({
                event_label: label
            }, params));
        }
    }, {
        key: 'itemEvent',
        value: function itemEvent(name, item, params) {
            this.event(name, item.headline || item.slugline, params);
        }
    }, {
        key: 'timingComplete',
        value: function timingComplete(name, value) {
            this._event('timing_complete', { name: name, value: value });
        }
    }, {
        key: 'pageview',
        value: function pageview(title, path) {
            if (window.gtag) {
                window.gtag('config', (0, _lodash.get)(window, 'newsroom.analytics'), {
                    page_title: title,
                    page_path: path
                });
            }
        }
    }, {
        key: 'itemView',
        value: function itemView(item) {
            if (item) {
                this.pageview(item.headline || item.slugline, '/wire?item=' + item._id);
            } else {
                this.pageview();
            }
        }
    }, {
        key: 'sendEvents',
        value: function sendEvents(events) {
            var _this = this;

            events.forEach(function (event) {
                _this._event(event);
            });
        }
    }]);

    return Analytics;
}();

// make it available


window.analytics = new Analytics();
exports.default = window.analytics;

/***/ }),

/***/ 30:
/***/ (function(module, exports, __webpack_require__) {

var engine = __webpack_require__(31)

var storages = __webpack_require__(32)
var plugins = [__webpack_require__(38)]

module.exports = engine.createStore(storages, plugins)


/***/ }),

/***/ 31:
/***/ (function(module, exports, __webpack_require__) {

var util = __webpack_require__(5)
var slice = util.slice
var pluck = util.pluck
var each = util.each
var bind = util.bind
var create = util.create
var isList = util.isList
var isFunction = util.isFunction
var isObject = util.isObject

module.exports = {
	createStore: createStore
}

var storeAPI = {
	version: '2.0.12',
	enabled: false,
	
	// get returns the value of the given key. If that value
	// is undefined, it returns optionalDefaultValue instead.
	get: function(key, optionalDefaultValue) {
		var data = this.storage.read(this._namespacePrefix + key)
		return this._deserialize(data, optionalDefaultValue)
	},

	// set will store the given value at key and returns value.
	// Calling set with value === undefined is equivalent to calling remove.
	set: function(key, value) {
		if (value === undefined) {
			return this.remove(key)
		}
		this.storage.write(this._namespacePrefix + key, this._serialize(value))
		return value
	},

	// remove deletes the key and value stored at the given key.
	remove: function(key) {
		this.storage.remove(this._namespacePrefix + key)
	},

	// each will call the given callback once for each key-value pair
	// in this store.
	each: function(callback) {
		var self = this
		this.storage.each(function(val, namespacedKey) {
			callback.call(self, self._deserialize(val), (namespacedKey || '').replace(self._namespaceRegexp, ''))
		})
	},

	// clearAll will remove all the stored key-value pairs in this store.
	clearAll: function() {
		this.storage.clearAll()
	},

	// additional functionality that can't live in plugins
	// ---------------------------------------------------

	// hasNamespace returns true if this store instance has the given namespace.
	hasNamespace: function(namespace) {
		return (this._namespacePrefix == '__storejs_'+namespace+'_')
	},

	// createStore creates a store.js instance with the first
	// functioning storage in the list of storage candidates,
	// and applies the the given mixins to the instance.
	createStore: function() {
		return createStore.apply(this, arguments)
	},
	
	addPlugin: function(plugin) {
		this._addPlugin(plugin)
	},
	
	namespace: function(namespace) {
		return createStore(this.storage, this.plugins, namespace)
	}
}

function _warn() {
	var _console = (typeof console == 'undefined' ? null : console)
	if (!_console) { return }
	var fn = (_console.warn ? _console.warn : _console.log)
	fn.apply(_console, arguments)
}

function createStore(storages, plugins, namespace) {
	if (!namespace) {
		namespace = ''
	}
	if (storages && !isList(storages)) {
		storages = [storages]
	}
	if (plugins && !isList(plugins)) {
		plugins = [plugins]
	}

	var namespacePrefix = (namespace ? '__storejs_'+namespace+'_' : '')
	var namespaceRegexp = (namespace ? new RegExp('^'+namespacePrefix) : null)
	var legalNamespaces = /^[a-zA-Z0-9_\-]*$/ // alpha-numeric + underscore and dash
	if (!legalNamespaces.test(namespace)) {
		throw new Error('store.js namespaces can only have alphanumerics + underscores and dashes')
	}
	
	var _privateStoreProps = {
		_namespacePrefix: namespacePrefix,
		_namespaceRegexp: namespaceRegexp,

		_testStorage: function(storage) {
			try {
				var testStr = '__storejs__test__'
				storage.write(testStr, testStr)
				var ok = (storage.read(testStr) === testStr)
				storage.remove(testStr)
				return ok
			} catch(e) {
				return false
			}
		},

		_assignPluginFnProp: function(pluginFnProp, propName) {
			var oldFn = this[propName]
			this[propName] = function pluginFn() {
				var args = slice(arguments, 0)
				var self = this

				// super_fn calls the old function which was overwritten by
				// this mixin.
				function super_fn() {
					if (!oldFn) { return }
					each(arguments, function(arg, i) {
						args[i] = arg
					})
					return oldFn.apply(self, args)
				}

				// Give mixing function access to super_fn by prefixing all mixin function
				// arguments with super_fn.
				var newFnArgs = [super_fn].concat(args)

				return pluginFnProp.apply(self, newFnArgs)
			}
		},

		_serialize: function(obj) {
			return JSON.stringify(obj)
		},

		_deserialize: function(strVal, defaultVal) {
			if (!strVal) { return defaultVal }
			// It is possible that a raw string value has been previously stored
			// in a storage without using store.js, meaning it will be a raw
			// string value instead of a JSON serialized string. By defaulting
			// to the raw string value in case of a JSON parse error, we allow
			// for past stored values to be forwards-compatible with store.js
			var val = ''
			try { val = JSON.parse(strVal) }
			catch(e) { val = strVal }

			return (val !== undefined ? val : defaultVal)
		},
		
		_addStorage: function(storage) {
			if (this.enabled) { return }
			if (this._testStorage(storage)) {
				this.storage = storage
				this.enabled = true
			}
		},

		_addPlugin: function(plugin) {
			var self = this

			// If the plugin is an array, then add all plugins in the array.
			// This allows for a plugin to depend on other plugins.
			if (isList(plugin)) {
				each(plugin, function(plugin) {
					self._addPlugin(plugin)
				})
				return
			}

			// Keep track of all plugins we've seen so far, so that we
			// don't add any of them twice.
			var seenPlugin = pluck(this.plugins, function(seenPlugin) {
				return (plugin === seenPlugin)
			})
			if (seenPlugin) {
				return
			}
			this.plugins.push(plugin)

			// Check that the plugin is properly formed
			if (!isFunction(plugin)) {
				throw new Error('Plugins must be function values that return objects')
			}

			var pluginProperties = plugin.call(this)
			if (!isObject(pluginProperties)) {
				throw new Error('Plugins must return an object of function properties')
			}

			// Add the plugin function properties to this store instance.
			each(pluginProperties, function(pluginFnProp, propName) {
				if (!isFunction(pluginFnProp)) {
					throw new Error('Bad plugin property: '+propName+' from plugin '+plugin.name+'. Plugins should only return functions.')
				}
				self._assignPluginFnProp(pluginFnProp, propName)
			})
		},
		
		// Put deprecated properties in the private API, so as to not expose it to accidential
		// discovery through inspection of the store object.
		
		// Deprecated: addStorage
		addStorage: function(storage) {
			_warn('store.addStorage(storage) is deprecated. Use createStore([storages])')
			this._addStorage(storage)
		}
	}

	var store = create(_privateStoreProps, storeAPI, {
		plugins: []
	})
	store.raw = {}
	each(store, function(prop, propName) {
		if (isFunction(prop)) {
			store.raw[propName] = bind(store, prop)			
		}
	})
	each(storages, function(storage) {
		store._addStorage(storage)
	})
	each(plugins, function(plugin) {
		store._addPlugin(plugin)
	})
	return store
}


/***/ }),

/***/ 32:
/***/ (function(module, exports, __webpack_require__) {

module.exports = [
	// Listed in order of usage preference
	__webpack_require__(17),
	__webpack_require__(33),
	__webpack_require__(34),
	__webpack_require__(35),
	__webpack_require__(36),
	__webpack_require__(37)
]


/***/ }),

/***/ 33:
/***/ (function(module, exports, __webpack_require__) {

// oldFF-globalStorage provides storage for Firefox
// versions 6 and 7, where no localStorage, etc
// is available.

var util = __webpack_require__(5)
var Global = util.Global

module.exports = {
	name: 'oldFF-globalStorage',
	read: read,
	write: write,
	each: each,
	remove: remove,
	clearAll: clearAll,
}

var globalStorage = Global.globalStorage

function read(key) {
	return globalStorage[key]
}

function write(key, data) {
	globalStorage[key] = data
}

function each(fn) {
	for (var i = globalStorage.length - 1; i >= 0; i--) {
		var key = globalStorage.key(i)
		fn(globalStorage[key], key)
	}
}

function remove(key) {
	return globalStorage.removeItem(key)
}

function clearAll() {
	each(function(key, _) {
		delete globalStorage[key]
	})
}


/***/ }),

/***/ 34:
/***/ (function(module, exports, __webpack_require__) {

// oldIE-userDataStorage provides storage for Internet Explorer
// versions 6 and 7, where no localStorage, sessionStorage, etc
// is available.

var util = __webpack_require__(5)
var Global = util.Global

module.exports = {
	name: 'oldIE-userDataStorage',
	write: write,
	read: read,
	each: each,
	remove: remove,
	clearAll: clearAll,
}

var storageName = 'storejs'
var doc = Global.document
var _withStorageEl = _makeIEStorageElFunction()
var disable = (Global.navigator ? Global.navigator.userAgent : '').match(/ (MSIE 8|MSIE 9|MSIE 10)\./) // MSIE 9.x, MSIE 10.x

function write(unfixedKey, data) {
	if (disable) { return }
	var fixedKey = fixKey(unfixedKey)
	_withStorageEl(function(storageEl) {
		storageEl.setAttribute(fixedKey, data)
		storageEl.save(storageName)
	})
}

function read(unfixedKey) {
	if (disable) { return }
	var fixedKey = fixKey(unfixedKey)
	var res = null
	_withStorageEl(function(storageEl) {
		res = storageEl.getAttribute(fixedKey)
	})
	return res
}

function each(callback) {
	_withStorageEl(function(storageEl) {
		var attributes = storageEl.XMLDocument.documentElement.attributes
		for (var i=attributes.length-1; i>=0; i--) {
			var attr = attributes[i]
			callback(storageEl.getAttribute(attr.name), attr.name)
		}
	})
}

function remove(unfixedKey) {
	var fixedKey = fixKey(unfixedKey)
	_withStorageEl(function(storageEl) {
		storageEl.removeAttribute(fixedKey)
		storageEl.save(storageName)
	})
}

function clearAll() {
	_withStorageEl(function(storageEl) {
		var attributes = storageEl.XMLDocument.documentElement.attributes
		storageEl.load(storageName)
		for (var i=attributes.length-1; i>=0; i--) {
			storageEl.removeAttribute(attributes[i].name)
		}
		storageEl.save(storageName)
	})
}

// Helpers
//////////

// In IE7, keys cannot start with a digit or contain certain chars.
// See https://github.com/marcuswestin/store.js/issues/40
// See https://github.com/marcuswestin/store.js/issues/83
var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g")
function fixKey(key) {
	return key.replace(/^\d/, '___$&').replace(forbiddenCharsRegex, '___')
}

function _makeIEStorageElFunction() {
	if (!doc || !doc.documentElement || !doc.documentElement.addBehavior) {
		return null
	}
	var scriptTag = 'script',
		storageOwner,
		storageContainer,
		storageEl

	// Since #userData storage applies only to specific paths, we need to
	// somehow link our data to a specific path.  We choose /favicon.ico
	// as a pretty safe option, since all browsers already make a request to
	// this URL anyway and being a 404 will not hurt us here.  We wrap an
	// iframe pointing to the favicon in an ActiveXObject(htmlfile) object
	// (see: http://msdn.microsoft.com/en-us/library/aa752574(v=VS.85).aspx)
	// since the iframe access rules appear to allow direct access and
	// manipulation of the document element, even for a 404 page.  This
	// document can be used instead of the current document (which would
	// have been limited to the current path) to perform #userData storage.
	try {
		/* global ActiveXObject */
		storageContainer = new ActiveXObject('htmlfile')
		storageContainer.open()
		storageContainer.write('<'+scriptTag+'>document.w=window</'+scriptTag+'><iframe src="/favicon.ico"></iframe>')
		storageContainer.close()
		storageOwner = storageContainer.w.frames[0].document
		storageEl = storageOwner.createElement('div')
	} catch(e) {
		// somehow ActiveXObject instantiation failed (perhaps some special
		// security settings or otherwse), fall back to per-path storage
		storageEl = doc.createElement('div')
		storageOwner = doc.body
	}

	return function(storeFunction) {
		var args = [].slice.call(arguments, 0)
		args.unshift(storageEl)
		// See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
		// and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
		storageOwner.appendChild(storageEl)
		storageEl.addBehavior('#default#userData')
		storageEl.load(storageName)
		storeFunction.apply(this, args)
		storageOwner.removeChild(storageEl)
		return
	}
}


/***/ }),

/***/ 35:
/***/ (function(module, exports, __webpack_require__) {

// cookieStorage is useful Safari private browser mode, where localStorage
// doesn't work but cookies do. This implementation is adopted from
// https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage

var util = __webpack_require__(5)
var Global = util.Global
var trim = util.trim

module.exports = {
	name: 'cookieStorage',
	read: read,
	write: write,
	each: each,
	remove: remove,
	clearAll: clearAll,
}

var doc = Global.document

function read(key) {
	if (!key || !_has(key)) { return null }
	var regexpStr = "(?:^|.*;\\s*)" +
		escape(key).replace(/[\-\.\+\*]/g, "\\$&") +
		"\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"
	return unescape(doc.cookie.replace(new RegExp(regexpStr), "$1"))
}

function each(callback) {
	var cookies = doc.cookie.split(/; ?/g)
	for (var i = cookies.length - 1; i >= 0; i--) {
		if (!trim(cookies[i])) {
			continue
		}
		var kvp = cookies[i].split('=')
		var key = unescape(kvp[0])
		var val = unescape(kvp[1])
		callback(val, key)
	}
}

function write(key, data) {
	if(!key) { return }
	doc.cookie = escape(key) + "=" + escape(data) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/"
}

function remove(key) {
	if (!key || !_has(key)) {
		return
	}
	doc.cookie = escape(key) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"
}

function clearAll() {
	each(function(_, key) {
		remove(key)
	})
}

function _has(key) {
	return (new RegExp("(?:^|;\\s*)" + escape(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(doc.cookie)
}


/***/ }),

/***/ 36:
/***/ (function(module, exports, __webpack_require__) {

var util = __webpack_require__(5)
var Global = util.Global

module.exports = {
	name: 'sessionStorage',
	read: read,
	write: write,
	each: each,
	remove: remove,
	clearAll: clearAll
}

function sessionStorage() {
	return Global.sessionStorage
}

function read(key) {
	return sessionStorage().getItem(key)
}

function write(key, data) {
	return sessionStorage().setItem(key, data)
}

function each(fn) {
	for (var i = sessionStorage().length - 1; i >= 0; i--) {
		var key = sessionStorage().key(i)
		fn(read(key), key)
	}
}

function remove(key) {
	return sessionStorage().removeItem(key)
}

function clearAll() {
	return sessionStorage().clear()
}


/***/ }),

/***/ 37:
/***/ (function(module, exports) {

// memoryStorage is a useful last fallback to ensure that the store
// is functions (meaning store.get(), store.set(), etc will all function).
// However, stored values will not persist when the browser navigates to
// a new page or reloads the current page.

module.exports = {
	name: 'memoryStorage',
	read: read,
	write: write,
	each: each,
	remove: remove,
	clearAll: clearAll,
}

var memoryStorage = {}

function read(key) {
	return memoryStorage[key]
}

function write(key, data) {
	memoryStorage[key] = data
}

function each(callback) {
	for (var key in memoryStorage) {
		if (memoryStorage.hasOwnProperty(key)) {
			callback(memoryStorage[key], key)
		}
	}
}

function remove(key) {
	delete memoryStorage[key]
}

function clearAll(key) {
	memoryStorage = {}
}


/***/ }),

/***/ 38:
/***/ (function(module, exports, __webpack_require__) {

module.exports = json2Plugin

function json2Plugin() {
	__webpack_require__(39)
	return {}
}


/***/ }),

/***/ 39:
/***/ (function(module, exports) {

/* eslint-disable */

//  json2.js
//  2016-10-28
//  Public Domain.
//  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
//  See http://www.JSON.org/js.html
//  This code should be minified before deployment.
//  See http://javascript.crockford.com/jsmin.html

//  USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
//  NOT CONTROL.

//  This file creates a global JSON object containing two methods: stringify
//  and parse. This file provides the ES5 JSON capability to ES3 systems.
//  If a project might run on IE8 or earlier, then this file should be included.
//  This file does nothing on ES5 systems.

//      JSON.stringify(value, replacer, space)
//          value       any JavaScript value, usually an object or array.
//          replacer    an optional parameter that determines how object
//                      values are stringified for objects. It can be a
//                      function or an array of strings.
//          space       an optional parameter that specifies the indentation
//                      of nested structures. If it is omitted, the text will
//                      be packed without extra whitespace. If it is a number,
//                      it will specify the number of spaces to indent at each
//                      level. If it is a string (such as "\t" or "&nbsp;"),
//                      it contains the characters used to indent at each level.
//          This method produces a JSON text from a JavaScript value.
//          When an object value is found, if the object contains a toJSON
//          method, its toJSON method will be called and the result will be
//          stringified. A toJSON method does not serialize: it returns the
//          value represented by the name/value pair that should be serialized,
//          or undefined if nothing should be serialized. The toJSON method
//          will be passed the key associated with the value, and this will be
//          bound to the value.

//          For example, this would serialize Dates as ISO strings.

//              Date.prototype.toJSON = function (key) {
//                  function f(n) {
//                      // Format integers to have at least two digits.
//                      return (n < 10)
//                          ? "0" + n
//                          : n;
//                  }
//                  return this.getUTCFullYear()   + "-" +
//                       f(this.getUTCMonth() + 1) + "-" +
//                       f(this.getUTCDate())      + "T" +
//                       f(this.getUTCHours())     + ":" +
//                       f(this.getUTCMinutes())   + ":" +
//                       f(this.getUTCSeconds())   + "Z";
//              };

//          You can provide an optional replacer method. It will be passed the
//          key and value of each member, with this bound to the containing
//          object. The value that is returned from your method will be
//          serialized. If your method returns undefined, then the member will
//          be excluded from the serialization.

//          If the replacer parameter is an array of strings, then it will be
//          used to select the members to be serialized. It filters the results
//          such that only members with keys listed in the replacer array are
//          stringified.

//          Values that do not have JSON representations, such as undefined or
//          functions, will not be serialized. Such values in objects will be
//          dropped; in arrays they will be replaced with null. You can use
//          a replacer function to replace those with JSON values.

//          JSON.stringify(undefined) returns undefined.

//          The optional space parameter produces a stringification of the
//          value that is filled with line breaks and indentation to make it
//          easier to read.

//          If the space parameter is a non-empty string, then that string will
//          be used for indentation. If the space parameter is a number, then
//          the indentation will be that many spaces.

//          Example:

//          text = JSON.stringify(["e", {pluribus: "unum"}]);
//          // text is '["e",{"pluribus":"unum"}]'

//          text = JSON.stringify(["e", {pluribus: "unum"}], null, "\t");
//          // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

//          text = JSON.stringify([new Date()], function (key, value) {
//              return this[key] instanceof Date
//                  ? "Date(" + this[key] + ")"
//                  : value;
//          });
//          // text is '["Date(---current time---)"]'

//      JSON.parse(text, reviver)
//          This method parses a JSON text to produce an object or array.
//          It can throw a SyntaxError exception.

//          The optional reviver parameter is a function that can filter and
//          transform the results. It receives each of the keys and values,
//          and its return value is used instead of the original value.
//          If it returns what it received, then the structure is not modified.
//          If it returns undefined then the member is deleted.

//          Example:

//          // Parse the text. Values that look like ISO date strings will
//          // be converted to Date objects.

//          myData = JSON.parse(text, function (key, value) {
//              var a;
//              if (typeof value === "string") {
//                  a =
//   /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
//                  if (a) {
//                      return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
//                          +a[5], +a[6]));
//                  }
//              }
//              return value;
//          });

//          myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
//              var d;
//              if (typeof value === "string" &&
//                      value.slice(0, 5) === "Date(" &&
//                      value.slice(-1) === ")") {
//                  d = new Date(value.slice(5, -1));
//                  if (d) {
//                      return d;
//                  }
//              }
//              return value;
//          });

//  This is a reference implementation. You are free to copy, modify, or
//  redistribute.

/*jslint
    eval, for, this
*/

/*property
    JSON, apply, call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== "object") {
    JSON = {};
}

(function () {
    "use strict";

    var rx_one = /^[\],:{}\s]*$/;
    var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
    var rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10
            ? "0" + n
            : n;
    }

    function this_value() {
        return this.valueOf();
    }

    if (typeof Date.prototype.toJSON !== "function") {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear() + "-" +
                        f(this.getUTCMonth() + 1) + "-" +
                        f(this.getUTCDate()) + "T" +
                        f(this.getUTCHours()) + ":" +
                        f(this.getUTCMinutes()) + ":" +
                        f(this.getUTCSeconds()) + "Z"
                : null;
        };

        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }

    var gap;
    var indent;
    var meta;
    var rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string)
            ? "\"" + string.replace(rx_escapable, function (a) {
                var c = meta[a];
                return typeof c === "string"
                    ? c
                    : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
            }) + "\""
            : "\"" + string + "\"";
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i;          // The loop counter.
        var k;          // The member key.
        var v;          // The member value.
        var length;
        var mind = gap;
        var partial;
        var value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === "object" &&
                typeof value.toJSON === "function") {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === "function") {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case "string":
            return quote(value);

        case "number":

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value)
                ? String(value)
                : "null";

        case "boolean":
        case "null":

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce "null". The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is "object", we might be dealing with an object or an array or
// null.

        case "object":

// Due to a specification blunder in ECMAScript, typeof null is "object",
// so watch out for that case.

            if (!value) {
                return "null";
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === "[object Array]") {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || "null";
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? "[]"
                    : gap
                        ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]"
                        : "[" + partial.join(",") + "]";
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === "object") {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === "string") {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap
                                    ? ": "
                                    : ":"
                            ) + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap
                                    ? ": "
                                    : ":"
                            ) + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? "{}"
                : gap
                    ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
                    : "{" + partial.join(",") + "}";
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== "function") {
        meta = {    // table of character substitutions
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            "\"": "\\\"",
            "\\": "\\\\"
        };
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = "";
            indent = "";

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === "number") {
                for (i = 0; i < space; i += 1) {
                    indent += " ";
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === "string") {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== "function" &&
                    (typeof replacer !== "object" ||
                    typeof replacer.length !== "number")) {
                throw new Error("JSON.stringify");
            }

// Make a fake root object containing our value under the key of "".
// Return the result of stringifying the value.

            return str("", {"": value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== "function") {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k;
                var v;
                var value = holder[key];
                if (value && typeof value === "object") {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            rx_dangerous.lastIndex = 0;
            if (rx_dangerous.test(text)) {
                text = text.replace(rx_dangerous, function (a) {
                    return "\\u" +
                            ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with "()" and "new"
// because they can cause invocation, and "=" because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with "@" (a non-JSON character). Second, we
// replace all simple value tokens with "]" characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or "]" or
// "," or ":" or "{" or "}". If that is so, then the text is safe for eval.

            if (
                rx_one.test(
                    text
                        .replace(rx_two, "@")
                        .replace(rx_three, "]")
                        .replace(rx_four, "")
                )
            ) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The "{" operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval("(" + text + ")");

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return (typeof reviver === "function")
                    ? walk({"": j}, "")
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError("JSON.parse");
        };
    }
}());

/***/ }),

/***/ 40:
/***/ (function(module, exports, __webpack_require__) {

var util = __webpack_require__(5)
var slice = util.slice
var assign = util.assign

var updatePlugin = __webpack_require__(41)

module.exports = [updatePlugin, operationsPlugin]

function operationsPlugin() {
	return {
		// array
		push: push,
		pop: pop,
		shift: shift,
		unshift: unshift,

		// obj
		assign: assign_,
	}

	// array
	function push(_, key, val1, val2, val3, etc) {
		return _arrayOp.call(this, 'push', arguments)
	}
	function pop(_, key) {
		return _arrayOp.call(this, 'pop', arguments)
	}
	function shift(_, key) {
		return _arrayOp.call(this, 'shift', arguments)
	}
	function unshift(_, key, val1, val2, val3, etc) {
		return _arrayOp.call(this, 'unshift', arguments)
	}

	// obj
	function assign_(_, key, props1, props2, props3, etc) {
		var varArgs = slice(arguments, 2)
		return this.update(key, {}, function(val) {
			if (typeof val != 'object') {
				throw new Error('store.assign called for non-object value with key "'+key+'"')
			}
			varArgs.unshift(val)
			return assign.apply(Object, varArgs)
		})
	}

	// internal
	///////////
	function _arrayOp(arrayFn, opArgs) {
		var res
		var key = opArgs[1]
		var rest = slice(opArgs, 2)
		this.update(key, [], function(arrVal) {
			res = Array.prototype[arrayFn].apply(arrVal, rest)
		})
		return res
	}
}


/***/ }),

/***/ 41:
/***/ (function(module, exports) {

module.exports = updatePlugin

function updatePlugin() {
	return {
		update: update
	}
	
	function update(_, key, optDefaultVal, updateFn) {
		if (arguments.length == 3) {
			updateFn = optDefaultVal
			optDefaultVal = undefined
		}
		var val = this.get(key, optDefaultVal)
		var retVal = updateFn(val)
		this.set(key, retVal != undefined ? retVal : val)
	}
}


/***/ }),

/***/ 5:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var assign = make_assign()
var create = make_create()
var trim = make_trim()
var Global = (typeof window !== 'undefined' ? window : global)

module.exports = {
	assign: assign,
	create: create,
	trim: trim,
	bind: bind,
	slice: slice,
	each: each,
	map: map,
	pluck: pluck,
	isList: isList,
	isFunction: isFunction,
	isObject: isObject,
	Global: Global
}

function make_assign() {
	if (Object.assign) {
		return Object.assign
	} else {
		return function shimAssign(obj, props1, props2, etc) {
			for (var i = 1; i < arguments.length; i++) {
				each(Object(arguments[i]), function(val, key) {
					obj[key] = val
				})
			}			
			return obj
		}
	}
}

function make_create() {
	if (Object.create) {
		return function create(obj, assignProps1, assignProps2, etc) {
			var assignArgsList = slice(arguments, 1)
			return assign.apply(this, [Object.create(obj)].concat(assignArgsList))
		}
	} else {
		function F() {} // eslint-disable-line no-inner-declarations
		return function create(obj, assignProps1, assignProps2, etc) {
			var assignArgsList = slice(arguments, 1)
			F.prototype = obj
			return assign.apply(this, [new F()].concat(assignArgsList))
		}
	}
}

function make_trim() {
	if (String.prototype.trim) {
		return function trim(str) {
			return String.prototype.trim.call(str)
		}
	} else {
		return function trim(str) {
			return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')
		}
	}
}

function bind(obj, fn) {
	return function() {
		return fn.apply(obj, Array.prototype.slice.call(arguments, 0))
	}
}

function slice(arr, index) {
	return Array.prototype.slice.call(arr, index || 0)
}

function each(obj, fn) {
	pluck(obj, function(val, key) {
		fn(val, key)
		return false
	})
}

function map(obj, fn) {
	var res = (isList(obj) ? [] : {})
	pluck(obj, function(v, k) {
		res[k] = fn(v, k)
		return false
	})
	return res
}

function pluck(obj, fn) {
	if (isList(obj)) {
		for (var i=0; i<obj.length; i++) {
			if (fn(obj[i], i)) {
				return obj[i]
			}
		}
	} else {
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				if (fn(obj[key], key)) {
					return obj[key]
				}
			}
		}
	}
}

function isList(val) {
	return (val != null && typeof val != 'function' && typeof val.length == 'number')
}

function isFunction(val) {
	return val && {}.toString.call(val) === '[object Function]'
}

function isObject(val) {
	return val && {}.toString.call(val) === '[object Object]'
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(27)))

/***/ }),

/***/ 53:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.HIDE_MODAL = exports.TOGGLE_DROPDOWN = exports.SELECT_MENU = exports.SET_ERROR = exports.INIT_DATA = exports.EDIT_USER = exports.GET_USER = exports.GET_TOPICS = undefined;
exports.getTopics = getTopics;
exports.getUser = getUser;
exports.editUser = editUser;
exports.initData = initData;
exports.setError = setError;
exports.selectMenu = selectMenu;
exports.toggleDropdown = toggleDropdown;
exports.hideModal = hideModal;
exports.fetchUser = fetchUser;
exports.saveUser = saveUser;
exports.fetchTopics = fetchTopics;
exports.editTopic = editTopic;
exports.deleteTopic = deleteTopic;
exports.shareTopic = shareTopic;
exports.submitShareTopic = submitShareTopic;
exports.submitFollowTopic = submitFollowTopic;

var _utils = __webpack_require__(2);

var _server = __webpack_require__(14);

var _server2 = _interopRequireDefault(_server);

var _actions = __webpack_require__(15);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var GET_TOPICS = exports.GET_TOPICS = 'GET_TOPICS';
function getTopics(topics) {
    return { type: GET_TOPICS, topics: topics };
}

var GET_USER = exports.GET_USER = 'GET_USER';
function getUser(user) {
    return { type: GET_USER, user: user };
}

var EDIT_USER = exports.EDIT_USER = 'EDIT_USER';
function editUser(event) {
    return { type: EDIT_USER, event: event };
}

var INIT_DATA = exports.INIT_DATA = 'INIT_DATA';
function initData(data) {
    return { type: INIT_DATA, data: data };
}

var SET_ERROR = exports.SET_ERROR = 'SET_ERROR';
function setError(errors) {
    return { type: SET_ERROR, errors: errors };
}

var SELECT_MENU = exports.SELECT_MENU = 'SELECT_MENU';
function selectMenu(data) {
    return { type: SELECT_MENU, data: data };
}

var TOGGLE_DROPDOWN = exports.TOGGLE_DROPDOWN = 'TOGGLE_DROPDOWN';
function toggleDropdown() {
    return { type: TOGGLE_DROPDOWN };
}

var HIDE_MODAL = exports.HIDE_MODAL = 'HIDE_MODAL';
function hideModal() {
    return { type: HIDE_MODAL };
}

/**
 * Fetches user details
 */
function fetchUser(id) {
    return function (dispatch) {
        return _server2.default.get('/users/' + id).then(function (data) {
            dispatch(getUser(data));
        }).catch(function (error) {
            return (0, _utils.errorHandler)(error, dispatch, setError);
        });
    };
}

/**
 * Saves a user
 *
 */
function saveUser() {
    return function (dispatch, getState) {

        var editedUser = getState().editedUser;
        var url = '/users/' + editedUser._id;

        return _server2.default.post(url, editedUser).then(function () {
            _utils.notify.success((0, _utils.gettext)('User updated successfully'));
            dispatch(fetchUser(editedUser._id));
        }).catch(function (error) {
            return (0, _utils.errorHandler)(error, dispatch, setError);
        });
    };
}

/**
 * Fetches followed topics for the user
 *
 */
function fetchTopics() {
    return function (dispatch, getState) {
        return _server2.default.get('/users/' + getState().user._id + '/topics').then(function (data) {
            return dispatch(getTopics(data._items));
        }).catch(function (error) {
            return (0, _utils.errorHandler)(error, dispatch, setError);
        });
    };
}

function editTopic(topic) {
    return (0, _actions.renderModal)('followTopic', { topic: topic });
}

/**
 * Deletes the given followed topic
 *
 */
function deleteTopic(topic) {
    return function (dispatch) {
        var url = '/topics/' + topic._id;
        return _server2.default.del(url).then(function () {
            _utils.notify.success((0, _utils.gettext)('Topic deleted successfully'));
            dispatch(fetchTopics());
        }).catch(function (error) {
            return (0, _utils.errorHandler)(error, dispatch, setError);
        });
    };
}

/**
 * Start share followed topic - display modal to pick users
 *
 * @return {function}
 */
function shareTopic(items) {
    return function (dispatch, getState) {
        var user = getState().user;
        var company = getState().company;
        return _server2.default.get('/companies/' + company + '/users').then(function (users) {
            return users.filter(function (u) {
                return u._id !== user._id;
            });
        }).then(function (users) {
            return dispatch((0, _actions.renderModal)('shareItem', { items: items, users: users }));
        }).catch(_utils.errorHandler);
    };
}

/**
 * Submit share followed topic form and close modal if that works
 *
 * @param {Object} data
 */
function submitShareTopic(data) {
    return function (dispatch) {
        return _server2.default.post('/topic_share', data).then(function () {
            _utils.notify.success((0, _utils.gettext)('Topic was shared successfully.'));
            dispatch((0, _actions.closeModal)());
        }).catch(_utils.errorHandler);
    };
}

/**
 * Updates a followed topic
 *
 */
function submitFollowTopic(topic) {
    return function (dispatch) {
        var url = '/topics/' + topic._id;
        return _server2.default.post(url, topic).then(function () {
            return dispatch(fetchTopics());
        }).then(function () {
            return dispatch((0, _actions.closeModal)());
        }).catch(_utils.errorHandler);
    };
}

/***/ }),

/***/ 636:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _utils = __webpack_require__(2);

var _reducers = __webpack_require__(637);

var _reducers2 = _interopRequireDefault(_reducers);

var _UserProfileApp = __webpack_require__(638);

var _UserProfileApp2 = _interopRequireDefault(_UserProfileApp);

var _actions = __webpack_require__(53);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var store = (0, _utils.createStore)(_reducers2.default);

if (window.profileData) {
    store.dispatch((0, _actions.initData)(window.profileData));
}

(0, _utils.render)(store, _UserProfileApp2.default, document.getElementById('header-profile-toggle'));

document.addEventListener('manage_topics', function () {
    store.dispatch((0, _actions.selectMenu)('topics'));
}, false);

/***/ }),

/***/ 637:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = itemReducer;

var _actions = __webpack_require__(53);

var _actions2 = __webpack_require__(15);

var _reducers = __webpack_require__(107);

var initialState = {
    user: null,
    editedUser: null,
    company: null,
    topics: null,
    topicsById: {},
    activeTopicId: null,
    isLoading: false,
    selectedMenu: 'profile',
    dropdown: false,
    displayModal: false
};

function itemReducer() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments[1];

    switch (action.type) {

        case _actions.GET_TOPICS:
            {
                var topicsById = Object.assign({}, state.topicsById);
                var topics = action.topics.map(function (topic) {
                    topicsById[topic._id] = topic;
                    return topic;
                });

                return _extends({}, state, {
                    topics: topics,
                    topicsById: topicsById,
                    activeTopicId: null,
                    isLoading: false
                });
            }

        case _actions.GET_USER:
            {
                return _extends({}, state, {
                    user: action.user,
                    editedUser: action.user
                });
            }

        case _actions.EDIT_USER:
            {

                var target = action.event.target;
                var field = target.name;
                var editedUser = Object.assign({}, state.editedUser);
                editedUser[field] = target.type === 'checkbox' ? target.checked : target.value;
                return _extends({}, state, { editedUser: editedUser, errors: null });
            }

        case _actions.INIT_DATA:
            {
                return _extends({}, state, {
                    user: action.data.user || null,
                    editedUser: action.data.user || null,
                    topics: action.data.topics || [],
                    company: action.data.company || null
                });
            }

        case _actions.SELECT_MENU:
            {
                return _extends({}, state, {
                    selectedMenu: action.data,
                    dropdown: false,
                    displayModal: true
                });
            }

        case _actions.TOGGLE_DROPDOWN:
            {
                return _extends({}, state, {
                    dropdown: !state.dropdown
                });
            }

        case _actions.HIDE_MODAL:
            {
                return _extends({}, state, {
                    displayModal: false
                });
            }

        case _actions2.RENDER_MODAL:
        case _actions2.CLOSE_MODAL:
            return _extends({}, state, { modal: (0, _reducers.modalReducer)(state.modal, action) });

        case _actions.SET_ERROR:
            return _extends({}, state, { errors: action.errors });

        default:
            return state;
    }
}

/***/ }),

/***/ 638:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(24);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = __webpack_require__(6);

var _actions = __webpack_require__(53);

var _FollowedTopics = __webpack_require__(639);

var _FollowedTopics2 = _interopRequireDefault(_FollowedTopics);

var _UserProfileMenu = __webpack_require__(640);

var _UserProfileMenu2 = _interopRequireDefault(_UserProfileMenu);

var _UserProfileAvatar = __webpack_require__(641);

var _UserProfileAvatar2 = _interopRequireDefault(_UserProfileAvatar);

var _utils = __webpack_require__(2);

var _FollowTopicModal = __webpack_require__(108);

var _FollowTopicModal2 = _interopRequireDefault(_FollowTopicModal);

var _ShareItemModal = __webpack_require__(109);

var _ShareItemModal2 = _interopRequireDefault(_ShareItemModal);

var _UserProfile = __webpack_require__(643);

var _UserProfile2 = _interopRequireDefault(_UserProfile);

var _ProfileToggle = __webpack_require__(644);

var _ProfileToggle2 = _interopRequireDefault(_ProfileToggle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var modals = {
    followTopic: _FollowTopicModal2.default,
    shareItem: _ShareItemModal2.default
};

var UserProfileApp = function (_React$Component) {
    _inherits(UserProfileApp, _React$Component);

    function UserProfileApp(props, context) {
        _classCallCheck(this, UserProfileApp);

        var _this = _possibleConstructorReturn(this, (UserProfileApp.__proto__ || Object.getPrototypeOf(UserProfileApp)).call(this, props, context));

        _this.links = [{
            name: 'profile',
            label: (0, _utils.gettext)('My Profile'),
            content: _UserProfile2.default
        }, {
            name: 'topics',
            label: (0, _utils.gettext)('My Topics'),
            content: _FollowedTopics2.default
        }];
        return _this;
    }

    _createClass(UserProfileApp, [{
        key: 'renderModal',
        value: function renderModal(specs) {
            if (specs) {
                var Modal = modals[specs.modal];
                return _reactDom2.default.createPortal(_react2.default.createElement(Modal, { data: specs.data }), document.getElementById('modal-container'));
            }
        }
    }, {
        key: 'renderProfile',
        value: function renderProfile() {
            var _this2 = this;

            var links = this.links.map(function (link) {
                link.active = link.name === _this2.props.selectedMenu;
                return link;
            });

            var modal = this.renderModal(this.props.modal);
            var ActiveContent = links.find(function (link) {
                return link.active;
            }).content;

            return _react2.default.createElement(
                'div',
                { className: 'profile-container' },
                _react2.default.createElement(
                    'div',
                    { className: 'profileWrap' },
                    _react2.default.createElement(
                        'div',
                        { className: 'profile__mobile-close d-md-none' },
                        _react2.default.createElement(
                            'button',
                            { className: 'icon-button', onClick: this.props.hideModal },
                            _react2.default.createElement('i', { className: 'icon--close-thin icon--gray-light' })
                        )
                    ),
                    _react2.default.createElement(
                        'nav',
                        { className: 'profile-side-navigation', id: 'profile-menu' },
                        _react2.default.createElement(_UserProfileAvatar2.default, {
                            user: this.props.user
                        }),
                        _react2.default.createElement(_UserProfileMenu2.default, {
                            onClick: this.props.selectMenu,
                            links: links
                        })
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'content' },
                        _react2.default.createElement(
                            'section',
                            { className: 'content-header' },
                            _react2.default.createElement(
                                'nav',
                                { className: 'profile-nav content-bar navbar content-bar--side-padding pr-0 d-none d-md-flex' },
                                _react2.default.createElement(
                                    'h5',
                                    { className: 'pl-xl-4 mb-0' },
                                    links.find(function (link) {
                                        return link.active;
                                    }).label
                                ),
                                _react2.default.createElement(
                                    'div',
                                    { className: 'content-bar__right' },
                                    _react2.default.createElement(
                                        'span',
                                        { className: 'content-bar__menu', onClick: this.props.hideModal },
                                        _react2.default.createElement('i', { className: 'icon--close-thin' })
                                    )
                                )
                            )
                        ),
                        _react2.default.createElement(
                            'section',
                            { className: 'content-main' },
                            _react2.default.createElement(ActiveContent, null)
                        )
                    ),
                    modal
                )
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var profile = _reactDom2.default.createPortal(this.props.displayModal ? this.renderProfile() : null, document.getElementById('user-profile-app'));

            var dropdown = this.props.dropdown && _react2.default.createElement(
                'div',
                { key: 'dropdown', className: 'dropdown-menu dropdown-menu-right show' },
                _react2.default.createElement(
                    'div',
                    { className: 'card card--inside-dropdown' },
                    _react2.default.createElement(
                        'div',
                        { className: 'card-header' },
                        this.props.user.first_name + ' ' + this.props.user.last_name
                    ),
                    _react2.default.createElement(
                        'ul',
                        { className: 'list-group list-group-flush' },
                        this.links.map(function (link) {
                            return _react2.default.createElement(
                                'li',
                                { key: link.name, className: 'list-group-item list-group-item--link' },
                                _react2.default.createElement(
                                    'a',
                                    { href: '', onClick: function onClick(e) {
                                            return _this3.props.selectMenu(e, link.name);
                                        } },
                                    link.label,
                                    _react2.default.createElement('i', { className: 'svg-icon--arrow-right' })
                                )
                            );
                        })
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'card-footer' },
                        _react2.default.createElement(
                            'a',
                            { href: '/logout', className: 'btn btn-outline-secondary float-right' },
                            (0, _utils.gettext)('Logout')
                        )
                    )
                )
            );

            var toggle = document.getElementById('header-profile-toggle');

            if (this.props.dropdown) {
                toggle.classList.add('show');
            } else {
                toggle.classList.remove('show');
            }

            return [_react2.default.createElement(_ProfileToggle2.default, { key: 'toggle',
                user: this.props.user,
                onClick: this.props.toggleDropdown
            }), dropdown, profile];
        }
    }]);

    return UserProfileApp;
}(_react2.default.Component);

UserProfileApp.propTypes = {
    user: _propTypes2.default.object,
    modal: _propTypes2.default.object,
    selectMenu: _propTypes2.default.func,
    dropdown: _propTypes2.default.bool,
    selectedMenu: _propTypes2.default.string,
    displayModal: _propTypes2.default.bool,
    toggleDropdown: _propTypes2.default.func,
    hideModal: _propTypes2.default.func
};

var mapStateToProps = function mapStateToProps(state) {
    return {
        user: state.user,
        modal: state.modal,
        dropdown: state.dropdown,
        selectedMenu: state.selectedMenu,
        displayModal: state.displayModal
    };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
    return {
        selectMenu: function selectMenu(event, name) {
            event.preventDefault();dispatch((0, _actions.selectMenu)(name));
        },
        toggleDropdown: function toggleDropdown() {
            return dispatch((0, _actions.toggleDropdown)());
        },
        hideModal: function hideModal() {
            return dispatch((0, _actions.hideModal)());
        }
    };
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(UserProfileApp);

/***/ }),

/***/ 639:
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

var _reactRedux = __webpack_require__(6);

var _ActionButton = __webpack_require__(94);

var _ActionButton2 = _interopRequireDefault(_ActionButton);

var _actions = __webpack_require__(53);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FollowedTopics = function (_React$Component) {
    _inherits(FollowedTopics, _React$Component);

    function FollowedTopics(props, context) {
        _classCallCheck(this, FollowedTopics);

        var _this = _possibleConstructorReturn(this, (FollowedTopics.__proto__ || Object.getPrototypeOf(FollowedTopics)).call(this, props, context));

        props.fetchTopics();
        return _this;
    }

    _createClass(FollowedTopics, [{
        key: 'getActionButtons',
        value: function getActionButtons(topic) {
            return this.props.actions.map(function (action) {
                return _react2.default.createElement(_ActionButton2.default, {
                    key: action.name,
                    item: topic,
                    className: 'icon-button',
                    displayName: false,
                    action: action
                });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            return _react2.default.createElement(
                'div',
                { className: 'profile-content container-fluid' },
                _react2.default.createElement(
                    'div',
                    { className: 'row pt-xl-4 pt-3 px-xl-4' },
                    this.props.topics && this.props.topics.map(function (topic) {
                        return _react2.default.createElement(
                            'div',
                            { key: topic._id, className: 'simple-card-wrap col-12 col-lg-6' },
                            _react2.default.createElement(
                                'div',
                                { className: 'simple-card' },
                                _react2.default.createElement(
                                    'div',
                                    { className: 'simple-card__header simple-card__header-with-icons' },
                                    _react2.default.createElement(
                                        'h6',
                                        { className: 'simple-card__headline' },
                                        topic.label
                                    ),
                                    _react2.default.createElement(
                                        'div',
                                        { className: 'simple-card__icons' },
                                        _this2.getActionButtons(topic)
                                    )
                                ),
                                _react2.default.createElement(
                                    'p',
                                    null,
                                    topic.description || ' '
                                ),
                                _react2.default.createElement(
                                    'span',
                                    { className: 'simple-card__date' },
                                    (0, _utils.gettext)('Created on'),
                                    ' ',
                                    (0, _utils.getLocaleDate)(topic._created)
                                )
                            )
                        );
                    })
                )
            );
        }
    }]);

    return FollowedTopics;
}(_react2.default.Component);

FollowedTopics.propTypes = {
    fetchTopics: _propTypes2.default.func.isRequired,
    topics: _propTypes2.default.arrayOf(_propTypes2.default.shape({
        _id: _propTypes2.default.string.isRequired,
        _created: _propTypes2.default.string.isRequired,
        label: _propTypes2.default.string.isRequired,
        description: _propTypes2.default.string
    })),
    actions: _propTypes2.default.arrayOf(_propTypes2.default.shape({
        name: _propTypes2.default.string,
        action: _propTypes2.default.func
    }))
};

var mapStateToProps = function mapStateToProps(state) {
    return {
        topics: state.topics
    };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
    return {
        fetchTopics: function fetchTopics() {
            return dispatch((0, _actions.fetchTopics)());
        },
        actions: [{
            name: (0, _utils.gettext)('Edit'),
            icon: 'edit',
            action: function action(topic) {
                return dispatch((0, _actions.editTopic)(topic));
            }
        }, {
            name: (0, _utils.gettext)('Share'),
            icon: 'share',
            action: function action(topic) {
                return dispatch((0, _actions.shareTopic)([topic]));
            }
        }, {
            name: (0, _utils.gettext)('Delete'),
            icon: 'trash',
            action: function action(topic) {
                return confirm((0, _utils.gettext)('Would you like to delete topic {{name}}?', { name: topic.label })) && dispatch((0, _actions.deleteTopic)(topic));
            }
        }]
    };
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(FollowedTopics);

/***/ }),

/***/ 640:
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

function UserProfileMenu(_ref) {
    var links = _ref.links,
        _onClick = _ref.onClick;

    return _react2.default.createElement(
        'div',
        { className: 'profile-side-navigation__items' },
        links.map(function (link) {
            return _react2.default.createElement(
                'a',
                { key: link.name,
                    href: '#',
                    className: 'btn btn-block btn-outline-' + (link.active ? 'primary' : 'secondary'),
                    name: link.name,
                    onClick: function onClick(event) {
                        return _onClick(event, link.name);
                    }
                },
                link.label
            );
        })
    );
}

UserProfileMenu.propTypes = {
    links: _propTypes2.default.array,
    onClick: _propTypes2.default.func
};

exports.default = UserProfileMenu;

/***/ }),

/***/ 641:
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

function UserProfileAvatar(_ref) {
    var user = _ref.user;

    var initials = [user.first_name, user.last_name].map(function (name) {
        return name[0].toLocaleUpperCase();
    }).join('');
    return _react2.default.createElement(
        'div',
        { className: 'profile__group profile__group--dark-bck' },
        _react2.default.createElement(
            'figure',
            { className: 'profile__avatar initials' },
            _react2.default.createElement(
                'span',
                { className: 'profile__characters' },
                initials
            )
        ),
        _react2.default.createElement(
            'div',
            { className: 'profile__name-container' },
            _react2.default.createElement(
                'h5',
                { className: 'profile__name' },
                user.first_name + ' ' + user.last_name
            ),
            user.username && _react2.default.createElement(
                'span',
                { className: 'profile__info' },
                user.username
            )
        )
    );
}

UserProfileAvatar.propTypes = {
    user: _propTypes2.default.shape({
        username: _propTypes2.default.string,
        first_name: _propTypes2.default.string,
        last_name: _propTypes2.default.string
    })
};

exports.default = UserProfileAvatar;

/***/ }),

/***/ 643:
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

var _utils = __webpack_require__(2);

var _TextInput = __webpack_require__(25);

var _TextInput2 = _interopRequireDefault(_TextInput);

var _CheckboxInput = __webpack_require__(26);

var _CheckboxInput2 = _interopRequireDefault(_CheckboxInput);

var _actions = __webpack_require__(53);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UserProfile = function (_React$Component) {
    _inherits(UserProfile, _React$Component);

    function UserProfile(props) {
        _classCallCheck(this, UserProfile);

        var _this = _possibleConstructorReturn(this, (UserProfile.__proto__ || Object.getPrototypeOf(UserProfile)).call(this, props));

        _this.save = _this.save.bind(_this);
        return _this;
    }

    _createClass(UserProfile, [{
        key: 'isFormValid',
        value: function isFormValid() {
            var valid = true;
            var errors = {};

            if (!this.props.user.first_name) {
                errors.first_name = [(0, _utils.gettext)('Please provide first name')];
                valid = false;
            }

            if (!this.props.user.last_name) {
                errors.last_name = [(0, _utils.gettext)('Please provide last name')];
                valid = false;
            }

            this.props.setError(errors);
            return valid;
        }
    }, {
        key: 'save',
        value: function save(event) {
            event.preventDefault();

            if (!this.isFormValid()) {
                return;
            }

            this.props.saveUser();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                user = _props.user,
                onChange = _props.onChange,
                errors = _props.errors;

            var onCancel = function onCancel() {
                return _this2.props.fetchUser(_this2.props.user._id);
            };
            return _react2.default.createElement(
                'form',
                { className: 'profile-content container-fluid' },
                _react2.default.createElement(
                    'div',
                    { className: 'row' },
                    _react2.default.createElement(
                        'div',
                        { className: 'col-12 col-xl-8' },
                        _react2.default.createElement(
                            'div',
                            { className: 'row pt-xl-4 pt-3 px-xl-4' },
                            _react2.default.createElement(
                                'div',
                                { className: 'col-lg-6' },
                                _react2.default.createElement(_TextInput2.default, {
                                    name: 'first_name',
                                    label: (0, _utils.gettext)('First Name'),
                                    value: user.first_name,
                                    onChange: onChange,
                                    error: errors ? errors.first_name : null })
                            ),
                            _react2.default.createElement(
                                'div',
                                { className: 'col-lg-6' },
                                _react2.default.createElement(_TextInput2.default, {
                                    name: 'last_name',
                                    label: (0, _utils.gettext)('Last Name'),
                                    value: user.last_name,
                                    onChange: onChange,
                                    error: errors ? errors.last_name : null })
                            ),
                            _react2.default.createElement(
                                'div',
                                { className: 'col-lg-12' },
                                _react2.default.createElement(_TextInput2.default, {
                                    name: 'phone',
                                    label: (0, _utils.gettext)('Telephone'),
                                    value: user.phone,
                                    onChange: onChange,
                                    error: errors ? errors.phone : null })
                            ),
                            _react2.default.createElement(
                                'div',
                                { className: 'col-lg-12' },
                                _react2.default.createElement(_CheckboxInput2.default, {
                                    name: 'receive_email',
                                    label: (0, _utils.gettext)('Receive notifications via email'),
                                    value: !!user.receive_email,
                                    onChange: onChange })
                            )
                        )
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'profile-content__footer px-xl-4' },
                    _react2.default.createElement('input', {
                        type: 'button',
                        className: 'btn btn-outline-secondary',
                        value: (0, _utils.gettext)('Cancel'),
                        onClick: onCancel }),
                    _react2.default.createElement('input', {
                        type: 'button',
                        className: 'btn btn-outline-primary',
                        value: (0, _utils.gettext)('Save Changes'),
                        onClick: this.save })
                )
            );
        }
    }]);

    return UserProfile;
}(_react2.default.Component);

UserProfile.propTypes = {
    user: _propTypes2.default.object.isRequired,
    onChange: _propTypes2.default.func,
    errors: _propTypes2.default.object,
    saveUser: _propTypes2.default.func,
    setError: _propTypes2.default.func,
    fetchUser: _propTypes2.default.func
};

var mapStateToProps = function mapStateToProps(state) {
    return {
        user: state.editedUser,
        errors: state.errors
    };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
    return {
        saveUser: function saveUser() {
            return dispatch((0, _actions.saveUser)());
        },
        fetchUser: function fetchUser(id) {
            return dispatch((0, _actions.fetchUser)(id));
        },
        onChange: function onChange(event) {
            return dispatch((0, _actions.editUser)(event));
        },
        setError: function setError(errors) {
            return dispatch((0, _actions.setError)(errors));
        }
    };
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(UserProfile);

/***/ }),

/***/ 644:
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

function ProfileToggle(_ref) {
    var user = _ref.user,
        _onClick = _ref.onClick;

    var initials = user.first_name[0].toLocaleUpperCase() + user.last_name[0].toLocaleUpperCase();

    return _react2.default.createElement(
        'div',
        { className: 'header-profile', onClick: function onClick(event) {
                event.preventDefault();
                _onClick();
            } },
        _react2.default.createElement(
            'figure',
            { className: 'header-profile__avatar' },
            _react2.default.createElement(
                'span',
                { className: 'header-profile__characters' },
                initials
            )
        )
    );
}

ProfileToggle.propTypes = {
    user: _propTypes2.default.shape({
        first_name: _propTypes2.default.string,
        last_name: _propTypes2.default.string
    }).isRequired,
    onClick: _propTypes2.default.func.isRequired
};

exports.default = ProfileToggle;

/***/ }),

/***/ 75:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function($) {

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.ModalPrimaryButton = ModalPrimaryButton;
exports.ModalSecondaryButton = ModalSecondaryButton;

__webpack_require__(134);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _utils = __webpack_require__(2);

var _reactRedux = __webpack_require__(6);

var _actions = __webpack_require__(15);

var _CloseButton = __webpack_require__(95);

var _CloseButton2 = _interopRequireDefault(_CloseButton);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Primary modal button for actions like save/send/etc
 *
 * @param {string} label
 * @param {string} type
 * @param {func} onClick
 */
function ModalPrimaryButton(_ref) {
    var label = _ref.label,
        type = _ref.type,
        onClick = _ref.onClick;

    assertButtonHandler(label, type, onClick);
    return _react2.default.createElement(
        'button',
        { type: type || 'button',
            onClick: onClick,
            className: 'btn btn-outline-primary'
        },
        label
    );
}

ModalPrimaryButton.propTypes = {
    label: _propTypes2.default.string.isRequired,
    type: _propTypes2.default.string,
    onClick: _propTypes2.default.func
};

/**
 * Secondary modal button for actions like cancel/reset
 *
 * @param {string} label
 * @param {string} type
 * @param {func} onClick
 */
function ModalSecondaryButton(_ref2) {
    var label = _ref2.label,
        type = _ref2.type,
        onClick = _ref2.onClick;

    assertButtonHandler(label, type, onClick);
    return _react2.default.createElement(
        'button',
        { type: type || 'button',
            onClick: onClick,
            className: 'btn btn-outline-secondary'
        },
        label
    );
}

ModalSecondaryButton.propTypes = {
    'label': _propTypes2.default.string.isRequired,
    onClick: _propTypes2.default.func,
    type: _propTypes2.default.string
};

/**
 * Test if button makes any sense
 *
 * either type or onClick handler must be specified
 *
 * @param {string} label
 * @param {string} type
 * @param {func} onClick
 */
function assertButtonHandler(label, type, onClick) {
    if (!type && !onClick) {
        console.warn('You should use either type or onClick handler for button', label);
    }
}

var Modal = function (_React$Component) {
    _inherits(Modal, _React$Component);

    function Modal() {
        _classCallCheck(this, Modal);

        return _possibleConstructorReturn(this, (Modal.__proto__ || Object.getPrototypeOf(Modal)).apply(this, arguments));
    }

    _createClass(Modal, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            $(this.elem).modal();
            $(this.elem).on('hidden.bs.modal', function () {
                _this2.props.closeModal();
            });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            $(this.elem).modal('hide'); // make sure it's gone
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            return _react2.default.createElement(
                'div',
                { className: 'modal mt-xl-5',
                    ref: function ref(elem) {
                        return _this3.elem = elem;
                    } },
                _react2.default.createElement(
                    'div',
                    { className: 'modal-dialog' },
                    _react2.default.createElement(
                        'div',
                        { className: 'modal-content' },
                        _react2.default.createElement(
                            'div',
                            { className: 'modal-header' },
                            _react2.default.createElement(
                                'h5',
                                { className: 'modal-title' },
                                this.props.title
                            ),
                            _react2.default.createElement(_CloseButton2.default, { onClick: this.props.closeModal })
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'modal-body' },
                            this.props.children
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'modal-footer' },
                            _react2.default.createElement(ModalSecondaryButton, {
                                type: 'reset',
                                label: this.props.onCancelLabel,
                                onClick: this.props.closeModal
                            }),
                            ' ',
                            _react2.default.createElement(ModalPrimaryButton, {
                                type: 'submit',
                                label: this.props.onSubmitLabel,
                                onClick: this.props.onSubmit
                            })
                        )
                    )
                )
            );
        }
    }]);

    return Modal;
}(_react2.default.Component);

Modal.propTypes = {
    title: _propTypes2.default.string.isRequired,
    children: _propTypes2.default.node.isRequired,
    onSubmit: _propTypes2.default.func.isRequired,
    onSubmitLabel: _propTypes2.default.string,
    onCancelLabel: _propTypes2.default.string,
    closeModal: _propTypes2.default.func.isRequired
};

Modal.defaultProps = {
    onSubmitLabel: (0, _utils.gettext)('Save'),
    onCancelLabel: (0, _utils.gettext)('Cancel')
};

exports.default = (0, _reactRedux.connect)(null, { closeModal: _actions.closeModal })(Modal);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(79)))

/***/ }),

/***/ 9:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SET_VIEW = exports.RESET_FILTER = exports.SET_CREATED_FILTER = exports.RECIEVE_NEXT_ITEMS = exports.START_LOADING = exports.TOGGLE_FILTER = exports.TOGGLE_NAVIGATION = exports.SET_NEW_ITEMS = exports.SET_TOPICS = exports.REMOVE_NEW_ITEMS = exports.SET_NEW_ITEMS_BY_TOPIC = exports.REMOVE_BOOKMARK = exports.BOOKMARK_ITEMS = exports.PRINT_ITEMS = exports.COPY_ITEMS = exports.DOWNLOAD_ITEMS = exports.SHARE_ITEMS = exports.SELECT_NONE = exports.SELECT_ALL = exports.TOGGLE_SELECTED = exports.TOGGLE_NEWS = exports.ADD_TOPIC = exports.INIT_DATA = exports.RECIEVE_ITEM = exports.RECIEVE_ITEMS = exports.QUERY_ITEMS = exports.SET_QUERY = exports.OPEN_ITEM = exports.PREVIEW_ITEM = exports.SET_ACTIVE = exports.SET_ITEMS = exports.SET_STATE = undefined;
exports.setState = setState;
exports.setItems = setItems;
exports.setActive = setActive;
exports.preview = preview;
exports.previewItem = previewItem;
exports.openItemDetails = openItemDetails;
exports.openItem = openItem;
exports.setQuery = setQuery;
exports.queryItems = queryItems;
exports.recieveItems = recieveItems;
exports.recieveItem = recieveItem;
exports.initData = initData;
exports.addTopic = addTopic;
exports.toggleNews = toggleNews;
exports.copyPreviewContents = copyPreviewContents;
exports.printItem = printItem;
exports.fetchItems = fetchItems;
exports.fetchItem = fetchItem;
exports.followTopic = followTopic;
exports.submitFollowTopic = submitFollowTopic;
exports.shareItems = shareItems;
exports.submitShareItem = submitShareItem;
exports.toggleSelected = toggleSelected;
exports.selectAll = selectAll;
exports.selectNone = selectNone;
exports.setShareItems = setShareItems;
exports.setDownloadItems = setDownloadItems;
exports.setCopyItem = setCopyItem;
exports.setPrintItem = setPrintItem;
exports.setBookmarkItems = setBookmarkItems;
exports.removeBookmarkItems = removeBookmarkItems;
exports.bookmarkItems = bookmarkItems;
exports.removeBookmarks = removeBookmarks;
exports.fetchVersions = fetchVersions;
exports.downloadItems = downloadItems;
exports.submitDownloadItems = submitDownloadItems;
exports.setNewItemsByTopic = setNewItemsByTopic;
exports.removeNewItems = removeNewItems;
exports.pushNotification = pushNotification;
exports.setNewItems = setNewItems;
exports.fetchNewItems = fetchNewItems;
exports.fetchNext = fetchNext;
exports.toggleNavigation = toggleNavigation;
exports.toggleFilter = toggleFilter;
exports.startLoading = startLoading;
exports.recieveNextItems = recieveNextItems;
exports.fetchMoreItems = fetchMoreItems;
exports.initParams = initParams;
exports.setCreatedFilter = setCreatedFilter;
exports.resetFilter = resetFilter;
exports.setTopicQuery = setTopicQuery;
exports.setView = setView;
exports.refresh = refresh;

var _lodash = __webpack_require__(7);

var _server = __webpack_require__(14);

var _server2 = _interopRequireDefault(_server);

var _analytics = __webpack_require__(28);

var _analytics2 = _interopRequireDefault(_analytics);

var _utils = __webpack_require__(2);

var _utils2 = __webpack_require__(11);

var _actions = __webpack_require__(15);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SET_STATE = exports.SET_STATE = 'SET_STATE';
function setState(state) {
    return { type: SET_STATE, state: state };
}

var SET_ITEMS = exports.SET_ITEMS = 'SET_ITEMS';
function setItems(items) {
    return { type: SET_ITEMS, items: items };
}

var SET_ACTIVE = exports.SET_ACTIVE = 'SET_ACTIVE';
function setActive(item) {
    return { type: SET_ACTIVE, item: item };
}

var PREVIEW_ITEM = exports.PREVIEW_ITEM = 'PREVIEW_ITEM';
function preview(item) {
    return { type: PREVIEW_ITEM, item: item };
}

function previewItem(item) {
    return function (dispatch, getState) {
        (0, _utils2.markItemAsRead)(item, getState());
        dispatch(preview(item));
        item && _analytics2.default.itemEvent('preview', item);
    };
}

var OPEN_ITEM = exports.OPEN_ITEM = 'OPEN_ITEM';
function openItemDetails(item) {
    return { type: OPEN_ITEM, item: item };
}

function openItem(item) {
    return function (dispatch, getState) {
        (0, _utils2.markItemAsRead)(item, getState());
        dispatch(openItemDetails(item));
        (0, _utils.updateRouteParams)({
            item: item ? item._id : null
        }, getState());
        item && _analytics2.default.itemEvent('open', item);
        _analytics2.default.itemView(item);
    };
}

var SET_QUERY = exports.SET_QUERY = 'SET_QUERY';
function setQuery(query) {
    query && _analytics2.default.event('search', query);
    return { type: SET_QUERY, query: query };
}

var QUERY_ITEMS = exports.QUERY_ITEMS = 'QUERY_ITEMS';
function queryItems() {
    return { type: QUERY_ITEMS };
}

var RECIEVE_ITEMS = exports.RECIEVE_ITEMS = 'RECIEVE_ITEMS';
function recieveItems(data) {
    return { type: RECIEVE_ITEMS, data: data };
}

var RECIEVE_ITEM = exports.RECIEVE_ITEM = 'RECIEVE_ITEM';
function recieveItem(data) {
    return { type: RECIEVE_ITEM, data: data };
}

var INIT_DATA = exports.INIT_DATA = 'INIT_DATA';
function initData(wireData, readData, newsOnly) {
    return { type: INIT_DATA, wireData: wireData, readData: readData, newsOnly: newsOnly };
}

var ADD_TOPIC = exports.ADD_TOPIC = 'ADD_TOPIC';
function addTopic(topic) {
    return { type: ADD_TOPIC, topic: topic };
}

var TOGGLE_NEWS = exports.TOGGLE_NEWS = 'TOGGLE_NEWS';
function toggleNews() {
    (0, _utils2.toggleNewsOnlyParam)();
    return { type: TOGGLE_NEWS };
}

/**
 * Copy contents of item preview.
 *
 * This is an initial version, should be updated with preview markup changes.
 */
function copyPreviewContents(item) {
    return function (dispatch, getState) {
        var preview = document.getElementById('preview-article');
        var selection = window.getSelection();
        var range = document.createRange();
        selection.removeAllRanges();
        range.selectNode(preview);
        selection.addRange(range);
        if (document.execCommand('copy')) {
            _utils.notify.success((0, _utils.gettext)('Item copied successfully.'));
            item && _analytics2.default.itemEvent('copy', item);
        } else {
            _utils.notify.error((0, _utils.gettext)('Sorry, Copy is not supported.'));
        }
        selection.removeAllRanges();
        if (getState().user) {
            _server2.default.post('/wire/' + item._id + '/copy').then(dispatch(setCopyItem(item._id))).catch(errorHandler);
        }
    };
}

function printItem(item) {
    return function (dispatch, getState) {
        window.open('/wire/' + item._id + '?print', '_blank');
        item && _analytics2.default.itemEvent('print', item);
        if (getState().user) {
            dispatch(setPrintItem(item._id));
        }
    };
}

/**
 * Search server request
 *
 * @param {Object} state
 * @param {bool} next
 * @return {Promise}
 */
function search(state, next) {
    var activeFilter = (0, _lodash.get)(state, 'wire.activeFilter', {});
    var activeNavigation = (0, _lodash.get)(state, 'wire.activeNavigation');
    var createdFilter = (0, _lodash.get)(state, 'wire.createdFilter', {});
    var newsOnly = !!state.newsOnly;

    var params = {
        q: state.query,
        bookmarks: state.bookmarks && state.user,
        navigation: activeNavigation,
        filter: !(0, _lodash.isEmpty)(activeFilter) && JSON.stringify(activeFilter),
        from: next ? state.items.length : 0,
        created_from: createdFilter.from,
        created_to: createdFilter.to,
        timezone_offset: (0, _utils.getTimezoneOffset)(),
        newsOnly: newsOnly
    };

    var queryString = Object.keys(params).filter(function (key) {
        return params[key];
    }).map(function (key) {
        return [key, params[key]].join('=');
    }).join('&');

    return _server2.default.get('/search?' + queryString);
}

/**
 * Fetch items for current query
 */
function fetchItems() {
    return function (dispatch, getState) {
        var start = Date.now();
        dispatch(queryItems());
        return search(getState()).then(function (data) {
            return dispatch(recieveItems(data));
        }).then(function () {
            var state = getState();
            (0, _utils.updateRouteParams)({
                q: state.query
            }, state);
            _analytics2.default.timingComplete('search', Date.now() - start);
        }).catch(errorHandler);
    };
}

function fetchItem(id) {
    return function (dispatch) {
        return _server2.default.get('/wire/' + id + '?format=json').then(function (data) {
            return dispatch(recieveItem(data));
        }).catch(errorHandler);
    };
}

/**
 * Start a follow topic action
 *
 * @param {String} topic
 */
function followTopic(topic) {
    return (0, _actions.renderModal)('followTopic', { topic: topic });
}

function submitFollowTopic(data) {
    return function (dispatch, getState) {
        var user = getState().user;
        var url = '/api/users/' + user + '/topics';
        data.timezone_offset = (0, _utils.getTimezoneOffset)();
        return _server2.default.post(url, data).then(function (updates) {
            return dispatch(addTopic(Object.assign(data, updates)));
        }).then(function () {
            return dispatch((0, _actions.closeModal)());
        }).catch(errorHandler);
    };
}

/**
 * Start share item action - display modal to pick users
 *
 * @return {function}
 */
function shareItems(items) {
    return function (dispatch, getState) {
        var user = getState().user;
        var company = getState().company;
        return _server2.default.get('/companies/' + company + '/users').then(function (users) {
            return users.filter(function (u) {
                return u._id !== user;
            });
        }).then(function (users) {
            return dispatch((0, _actions.renderModal)('shareItem', { items: items, users: users }));
        }).catch(errorHandler);
    };
}

/**
 * Submit share item form and close modal if that works
 *
 * @param {Object} data
 */
function submitShareItem(data) {
    return function (dispatch, getState) {
        return _server2.default.post('/wire_share', data).then(function () {
            if (data.items.length > 1) {
                _utils.notify.success((0, _utils.gettext)('Items were shared successfully.'));
            } else {
                _utils.notify.success((0, _utils.gettext)('Item was shared successfully.'));
            }
            dispatch((0, _actions.closeModal)());
        }).then(function () {
            return multiItemEvent('share', data.items, getState());
        }).then(function () {
            return dispatch(setShareItems(data.items));
        }).catch(errorHandler);
    };
}

var TOGGLE_SELECTED = exports.TOGGLE_SELECTED = 'TOGGLE_SELECTED';
function toggleSelected(item) {
    return { type: TOGGLE_SELECTED, item: item };
}

var SELECT_ALL = exports.SELECT_ALL = 'SELECT_ALL';
function selectAll() {
    return { type: SELECT_ALL };
}

var SELECT_NONE = exports.SELECT_NONE = 'SELECT_NONE';
function selectNone() {
    return { type: SELECT_NONE };
}

var SHARE_ITEMS = exports.SHARE_ITEMS = 'SHARE_ITEMS';
function setShareItems(items) {
    return { type: SHARE_ITEMS, items: items };
}

var DOWNLOAD_ITEMS = exports.DOWNLOAD_ITEMS = 'DOWNLOAD_ITEMS';
function setDownloadItems(items) {
    return { type: DOWNLOAD_ITEMS, items: items };
}

var COPY_ITEMS = exports.COPY_ITEMS = 'COPY_ITEMS';
function setCopyItem(item) {
    return { type: COPY_ITEMS, items: [item] };
}

var PRINT_ITEMS = exports.PRINT_ITEMS = 'PRINT_ITEMS';
function setPrintItem(item) {
    return { type: PRINT_ITEMS, items: [item] };
}

var BOOKMARK_ITEMS = exports.BOOKMARK_ITEMS = 'BOOKMARK_ITEMS';
function setBookmarkItems(items) {
    return { type: BOOKMARK_ITEMS, items: items };
}

var REMOVE_BOOKMARK = exports.REMOVE_BOOKMARK = 'REMOVE_BOOKMARK';
function removeBookmarkItems(items) {
    return { type: REMOVE_BOOKMARK, items: items };
}

function bookmarkItems(items) {
    return function (dispatch, getState) {
        return _server2.default.post('/wire_bookmark', { items: items }).then(function () {
            if (items.length > 1) {
                _utils.notify.success((0, _utils.gettext)('Items were bookmarked successfully.'));
            } else {
                _utils.notify.success((0, _utils.gettext)('Item was bookmarked successfully.'));
            }
        }).then(function () {
            multiItemEvent('bookmark', items, getState());
        }).then(function () {
            return dispatch(setBookmarkItems(items));
        }).catch(errorHandler);
    };
}

function removeBookmarks(items) {
    return function (dispatch, getState) {
        return _server2.default.del('/wire_bookmark', { items: items }).then(function () {
            if (items.length > 1) {
                _utils.notify.success((0, _utils.gettext)('Items were removed from bookmarks successfully.'));
            } else {
                _utils.notify.success((0, _utils.gettext)('Item was removed from bookmarks successfully.'));
            }
        }).then(function () {
            return dispatch(removeBookmarkItems(items));
        }).then(function () {
            return getState().bookmarks && dispatch(fetchItems());
        }).catch(errorHandler);
    };
}

function errorHandler(reason) {
    console.error('error', reason);
}

/**
 * Fetch item versions.
 *
 * @param {Object} item
 * @return {Promise}
 */
function fetchVersions(item) {
    return function () {
        return _server2.default.get('/wire/' + item._id + '/versions').then(function (data) {
            return data._items;
        });
    };
}

/**
 * Download items - display modal to pick a format
 *
 * @param {Array} items
 */
function downloadItems(items) {
    return (0, _actions.renderModal)('downloadItems', { items: items });
}

/**
 * Start download - open download view in new window.
 *
 * @param {Array} items
 * @param {String} format
 */
function submitDownloadItems(items, format) {
    return function (dispatch, getState) {
        window.open('/download/' + items.join(',') + '?format=' + format, '_blank');
        dispatch(setDownloadItems(items));
        dispatch((0, _actions.closeModal)());
        multiItemEvent('download', items, getState());
    };
}

var SET_NEW_ITEMS_BY_TOPIC = exports.SET_NEW_ITEMS_BY_TOPIC = 'SET_NEW_ITEMS_BY_TOPIC';
function setNewItemsByTopic(data) {
    return { type: SET_NEW_ITEMS_BY_TOPIC, data: data };
}

var REMOVE_NEW_ITEMS = exports.REMOVE_NEW_ITEMS = 'REMOVE_NEW_ITEMS';
function removeNewItems(data) {
    return { type: REMOVE_NEW_ITEMS, data: data };
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
            case 'topic_matches':
                return dispatch(setNewItemsByTopic(push.extra));

            case 'new_item':
                return new Promise(function (resolve, reject) {
                    dispatch(fetchNewItems()).then(resolve).catch(reject);
                });

            case 'topics:' + user:
                return dispatch(reloadTopics(user));
        }
    };
}

function reloadTopics(user) {
    return function (dispatch) {
        return _server2.default.get('/users/' + user + '/topics').then(function (data) {
            return dispatch(setTopics(data._items));
        }).catch(errorHandler);
    };
}

var SET_TOPICS = exports.SET_TOPICS = 'SET_TOPICS';
function setTopics(topics) {
    return { type: SET_TOPICS, topics: topics };
}

var SET_NEW_ITEMS = exports.SET_NEW_ITEMS = 'SET_NEW_ITEMS';
function setNewItems(data) {
    return { type: SET_NEW_ITEMS, data: data };
}

function fetchNewItems() {
    return function (dispatch, getState) {
        return search(getState()).then(function (response) {
            return dispatch(setNewItems(response));
        });
    };
}

function fetchNext(item) {
    return function () {
        if (!item.nextversion) {
            return Promise.reject();
        }

        return _server2.default.get('/wire/' + item.nextversion + '?format=json');
    };
}

var TOGGLE_NAVIGATION = exports.TOGGLE_NAVIGATION = 'TOGGLE_NAVIGATION';
function _toggleNavigation(navigation) {
    return { type: TOGGLE_NAVIGATION, navigation: navigation };
}

function toggleNavigation(navigation) {
    return function (dispatch) {
        dispatch(setQuery(''));
        dispatch(_toggleNavigation(navigation));
        return dispatch(fetchItems());
    };
}

var TOGGLE_FILTER = exports.TOGGLE_FILTER = 'TOGGLE_FILTER';
function toggleFilter(key, val, single) {
    return function (dispatch) {
        dispatch({ type: TOGGLE_FILTER, key: key, val: val, single: single });
        dispatch(fetchItems());
    };
}

var START_LOADING = exports.START_LOADING = 'START_LOADING';
function startLoading() {
    return { type: START_LOADING };
}

var RECIEVE_NEXT_ITEMS = exports.RECIEVE_NEXT_ITEMS = 'RECIEVE_NEXT_ITEMS';
function recieveNextItems(data) {
    return { type: RECIEVE_NEXT_ITEMS, data: data };
}

var MAX_ITEMS = 1000; // server limit
function fetchMoreItems() {
    return function (dispatch, getState) {
        var state = getState();
        var limit = Math.min(MAX_ITEMS, state.totalItems);

        if (state.isLoading || state.items.length >= limit) {
            return Promise.reject();
        }

        dispatch(startLoading());
        return search(getState(), true).then(function (data) {
            return dispatch(recieveNextItems(data));
        }).catch(errorHandler);
    };
}

/**
 * Set state on app init using url params
 *
 * @param {URLSearchParams} params
 */
function initParams(params) {
    return function (dispatch, getState) {
        if (params.get('q')) {
            dispatch(setQuery(params.get('q')));
        }
        if (params.get('item')) {
            dispatch(fetchItem(params.get('item'))).then(function () {
                var item = getState().itemsById[params.get('item')];
                dispatch(openItem(item));
            });
        }
    };
}

function _setCreatedFilter(filter) {
    return { type: SET_CREATED_FILTER, filter: filter };
}

var SET_CREATED_FILTER = exports.SET_CREATED_FILTER = 'SET_CREATED_FILTER';
function setCreatedFilter(filter) {
    return function (dispatch) {
        dispatch(_setCreatedFilter(filter));
        dispatch(fetchItems());
    };
}

function _resetFilter(filter) {
    return { type: RESET_FILTER, filter: filter };
}

var RESET_FILTER = exports.RESET_FILTER = 'RESET_FILTER';
function resetFilter(filter) {
    return function (dispatch) {
        dispatch(_resetFilter(filter));
        dispatch(fetchItems());
    };
}

/**
 * Set query for given topic
 *
 * @param {Object} topic
 * @return {Promise}
 */
function setTopicQuery(topic) {
    return function (dispatch) {
        dispatch(_toggleNavigation());
        dispatch(setQuery(topic.query || ''));
        dispatch(_resetFilter(topic.filter));
        dispatch(_setCreatedFilter(topic.created));
        return dispatch(fetchItems());
    };
}

var SET_VIEW = exports.SET_VIEW = 'SET_VIEW';
function setView(view) {
    localStorage.setItem('view', view);
    return { type: SET_VIEW, view: view };
}

function refresh() {
    return function (dispatch, getState) {
        return dispatch(recieveItems(getState().newItemsData));
    };
}

function multiItemEvent(event, items, state) {
    items.forEach(function (itemId) {
        var item = state.itemsById[itemId];
        item && _analytics2.default.itemEvent(event, item);
    });
}

/***/ }),

/***/ 94:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function($) {

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _classnames = __webpack_require__(21);

var _classnames2 = _interopRequireDefault(_classnames);

var _utils = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ActionButton = function (_React$Component) {
    _inherits(ActionButton, _React$Component);

    function ActionButton() {
        _classCallCheck(this, ActionButton);

        return _possibleConstructorReturn(this, (ActionButton.__proto__ || Object.getPrototypeOf(ActionButton)).apply(this, arguments));
    }

    _createClass(ActionButton, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (!(0, _utils.isTouchDevice)()) {
                this.elem && $(this.elem).tooltip();
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.elem && $(this.elem).tooltip('dispose'); // make sure it's gone
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var classes = (0, _classnames2.default)('icon--' + this.props.action.icon, {
                'icon--gray': this.props.isVisited
            });
            return _react2.default.createElement(
                'button',
                {
                    type: 'button',
                    className: this.props.className,
                    onClick: function onClick() {
                        return _this2.props.action.action(_this2.props.action.multi ? [_this2.props.item._id] : _this2.props.item);
                    },
                    ref: function ref(elem) {
                        return _this2.elem = elem;
                    },
                    title: !this.props.displayName ? this.props.action.name : '' },
                _react2.default.createElement('i', { className: classes }),
                this.props.displayName && this.props.action.name
            );
        }
    }]);

    return ActionButton;
}(_react2.default.Component);

ActionButton.propTypes = {
    item: _propTypes2.default.object,
    className: _propTypes2.default.string,
    displayName: _propTypes2.default.bool,
    isVisited: _propTypes2.default.bool,
    action: _propTypes2.default.shape({
        name: _propTypes2.default.string.isRequired,
        icon: _propTypes2.default.string.isRequired,
        action: _propTypes2.default.func.isRequired,
        multi: _propTypes2.default.bool
    })
};

exports.default = ActionButton;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(79)))

/***/ }),

/***/ 95:
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

},[636]);