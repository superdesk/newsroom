import React from 'react';
import PropTypes from 'prop-types';
import { gettext } from 'utils';

import PreviewBox from 'ui/components/PreviewBox';
import AgendaCoverages from './AgendaCoverages';

export default function AgendaPreviewCoverages({item}) {
    if (!item.coverages) {
        return null;
    }

    return (
        <PreviewBox label={gettext('Coverages')}>
            <AgendaCoverages item={item} />
        </PreviewBox>
    );
}

AgendaPreviewCoverages.propTypes = {
    item: PropTypes.object,
};