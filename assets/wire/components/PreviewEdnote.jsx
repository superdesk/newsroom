import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { gettext } from 'utils';
import InfoBox from './InfoBox';


/**
 * @return {null}
 */
function PreviewEdnote({item, isItemDetail}) {
    const privateNote = get(item, 'extra.sttnote_private');
    return (
        item.ednote || privateNote ? <InfoBox label={gettext('Note')} top={!isItemDetail}>
            <div className='column__preview__tags__column'>
                <div>{item.ednote}</div>
                <div>{privateNote}</div>
            </div>
        </InfoBox> : null
    );
}

PreviewEdnote.propTypes = {
    item: PropTypes.object,
    isItemDetail: PropTypes.bool,
};

export default PreviewEdnote;
