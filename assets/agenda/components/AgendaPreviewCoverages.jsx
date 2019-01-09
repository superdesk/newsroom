import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import { get, isEmpty } from 'lodash';
import { gettext } from 'utils';

import PreviewBox from 'ui/components/PreviewBox';
import AgendaCoverages from './AgendaCoverages';

export default function AgendaPreviewCoverages({item, currentCoverage, previousCoverage}) {
    return (
        <Fragment>
            {get(currentCoverage, 'length', 0) > 0 && <PreviewBox label={gettext('Coverages')}>
                <AgendaCoverages item={item} coverages={currentCoverage}/>
            </PreviewBox>}

            {get(previousCoverage, 'length', 0) > 0 && <PreviewBox label={gettext('Previous Coverages')}>
                <AgendaCoverages item={item} coverages={previousCoverage}/>
            </PreviewBox>}
        </Fragment>
    );
}

AgendaPreviewCoverages.propTypes = {
    item: PropTypes.object,
    currentCoverage: PropTypes.arrayOf(PropTypes.object),
    previousCoverage: PropTypes.arrayOf(PropTypes.object),
};