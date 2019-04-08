import React from 'react';

import {gettext} from 'utils';

import {hasCoverages} from '../utils';
import AgendaCoverages from './AgendaCoverages';

export default function AgendaDetailCoverages({item}) {
    if (!hasCoverages(item)) {
        return null;
    }

    return [
        <span key="label" className="column__preview__tags__box-headline">{gettext('Coverages')}</span>,
        <div key="content" className="column__preview__tags__column pt-4 pb-2">
            <AgendaCoverages item={item} />
        </div>,
    ];
}