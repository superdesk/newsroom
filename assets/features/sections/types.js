import PropTypes from 'prop-types';

export const sectionsPropType = PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
}));
