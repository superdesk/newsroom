import React from 'react';
import PropTypes from 'prop-types';

import {bem} from 'ui/utils';
import {formatDate} from 'utils';

import AgendaListItemLabels from './AgendaListItemLabels';
import MetaTime from './MetaTime';

export default function AgendaTime({item}) {
    return (
        <div className="wire-column__preview__content-header mb-2">
            <MetaTime item={item} />
            <div className={bem('wire-column__preview', 'date', 'event')}>{formatDate(item.dates.start)}</div>
            <AgendaListItemLabels item={item} />
        </div>
    );
}

AgendaTime.propTypes = {
    item: PropTypes.object.isRequired,
};