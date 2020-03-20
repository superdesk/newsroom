import PropTypes from 'prop-types';

const user = PropTypes.string;

const item = PropTypes.shape({
    'slugline': PropTypes.string,
});

const actions = PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    action: PropTypes.func,
    url: PropTypes.func,
}));

const topics = PropTypes.arrayOf(PropTypes.shape({
    query: PropTypes.string,
}));

const previewConfig = PropTypes.shape({

});

const types = {
    user,
    item,
    topics,
    actions,
    previewConfig,
};

export default types;
