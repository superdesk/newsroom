import React from 'react';
import PropTypes from 'prop-types';

import {bem} from 'ui/utils';
import {formatAgendaDate} from 'utils';

import AgendaListItemLabels from './AgendaListItemLabels';
// import MetaTime from 'ui/components/MetaTime';

export default function AgendaTime({item}) {
    return (
        <div className="wire-column__preview__content-header mb-2">
            {/*<MetaTime date={item.dates.start} />*/}
            <div className={bem('wire-column__preview', 'date', 'event')}>{formatAgendaDate(item.dates)}</div>
            <AgendaListItemLabels item={item} />
        </div>
    );
}

AgendaTime.propTypes = {
    item: PropTypes.object.isRequired,
};