import React from 'react';
import PropTypes from 'prop-types';

import { gettext } from 'utils';
import { hasAttachments } from '../utils';

import PreviewBox from 'ui/components/PreviewBox';
import AgendaAttachments from './AgendaAttachments';

export default function AgendaPreviewAttachments({item}) {
    if (!hasAttachments(item)) {
        return null;
    }

    return (
        <PreviewBox label={gettext('Attachments')}>
            <AgendaAttachments item={item} />
        </PreviewBox>
    );
}

AgendaPreviewAttachments.propTypes = {
    item: PropTypes.object.isRequired,
};