import React from 'react';
import PropTypes from 'prop-types';
import { gettext } from 'utils';
import InfoBox from './InfoBox';


function PreviewEdnote({item}) {
    return (
        item.ednote ? <InfoBox label={gettext('Note')}>
            <div>{item.ednote}</div>
        </InfoBox> : null
    );
}

PreviewEdnote.propTypes = {
    item: PropTypes.object,
};

export default PreviewEdnote;
