import React from 'react';
import PropTypes from 'prop-types';
import { gettext } from 'utils';
import InfoBox from './InfoBox';


function PreviewEdnote({item, isItemDetail}) {
    return (
        item.ednote ? <InfoBox label={gettext('Note')} top={!isItemDetail}>
            {item.ednote}
        </InfoBox> : null
    );
}

PreviewEdnote.propTypes = {
    item: PropTypes.object,
    isItemDetail: PropTypes.bool,
};

export default PreviewEdnote;
