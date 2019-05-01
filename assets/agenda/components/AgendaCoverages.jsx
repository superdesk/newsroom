import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import { gettext, formatCoverageDate } from 'utils';
import CoverageItemStatus from './CoverageItemStatus';
import {getCoverageDisplayName, getCoverageIcon, WORKFLOW_COLORS, getNotesFromCoverages, WORKFLOW_STATUS, isCoverageBeingUpdated} from '../utils';
import AgendaInternalNote from './AgendaInternalNote';
import AgendaEdNote from './AgendaEdNote';


export default function AgendaCoverages({item, coverages}) {
    if (isEmpty(coverages)) {
        return null;
    }

    const internalNotes = getNotesFromCoverages(item);
    const edNotes = getNotesFromCoverages(item, 'ednote');
    const getItemText = (coverage) => {
        return coverage.item_description_text || coverage.item_headline || coverage.item_slugline;
    };

    const getSlugline = (coverage) => {
        const slugline = coverage.item_slugline || coverage.slugline;

        return slugline ? ` | ${slugline}` : '';
    };

    return coverages.map((coverage) => (
        <div className='coverage-item' key={coverage.coverage_id}>
            <div className='coverage-item__row'>
                <span className='d-flex coverage-item--element-grow text-overflow-ellipsis'>
                    <i className={`icon-small--coverage-${getCoverageIcon(coverage.coverage_type)} ${WORKFLOW_COLORS[coverage.workflow_status]} mr-2`}></i>
                    <span className='text-overflow-ellipsis'>
                        {`${getCoverageDisplayName(coverage.coverage_type)}${getSlugline(coverage)}`}
                    </span>
                </span>
                {coverage.workflow_status !== WORKFLOW_STATUS.COMPLETED && <span className='d-flex text-nowrap'>
                    <i className='icon-small--clock icon--gray mr-1'></i>
                    <span className='coverage-item__text-label mr-1'>{gettext('expected')}:</span>
                    <span>{formatCoverageDate(coverage.scheduled)}</span>
                </span>}
            </div>

            <div className='coverage-item__row'>
                <p className='wire-articles__item__text m-0'>{getItemText(coverage)}</p>
            </div>

            {isCoverageBeingUpdated(coverage) && (
                <div className='coverage-item__row'>
                    <span className='label label--blue'>{gettext('Update coming')}</span>
                </div>                
            )}

            <div className='coverage-item__row'>
                {coverage.coverage_provider && <span className='coverage-item__text-label mr-1'>{gettext('Source')}:</span>}
                {coverage.coverage_provider && <span className='mr-2'>{coverage.coverage_provider}</span>}
                <CoverageItemStatus coverage={coverage} />
            </div>

            {!isEmpty(edNotes) && edNotes[coverage.coverage_id] && <div className='coverage-item__row'>
                <AgendaEdNote item={{ednote: edNotes[coverage.coverage_id]}} noMargin/>
            </div>}

            {!isEmpty(internalNotes) && internalNotes[coverage.coverage_id] && <div className='coverage-item__row'>
                <AgendaInternalNote internalNote={internalNotes[coverage.coverage_id]} noMargin />
            </div>}
        </div>
    ));
}

AgendaCoverages.propTypes = {
    item: PropTypes.object,
    coverages: PropTypes.arrayOf(PropTypes.object),
};