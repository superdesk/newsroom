import React from 'react';
import PropTypes from 'prop-types';

import {getName} from '../utils';

export default function AgendaName({item}) {
    return (
        <h2 className="wire-column__preview__headline mt-4">{getName(item)}</h2>
    );
}

AgendaName.propTypes = {
    item: PropTypes.object.isRequired,
};