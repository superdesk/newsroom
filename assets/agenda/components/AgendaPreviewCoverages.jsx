import React from 'react';
import PropTypes from 'prop-types';
import { gettext } from 'utils';

import AgendaCoverages from './AgendaCoverages';

export default function AgendaPreviewCoverages({item}) {
    if (!item.coverages) {
        return null;
    }

    return (
        <div className='wire-column__preview__coverage'>
            <div className='wire-column__preview__coverage__headline'>{gettext('Coverages')}</div>
            <AgendaCoverages coverages={item.coverages} />
        </div>
    );
}

AgendaPreviewCoverages.propTypes = {
    item: PropTypes.object,
};