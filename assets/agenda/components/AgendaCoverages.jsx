import React from 'react';
import PropTypes from 'prop-types';
import { gettext, formatDate} from 'utils';

const getCoverageStatusClass = (coverage) =>
    coverage.workflow_status === 'active' ? 'icon--green' : 'icon--gray-light';

export default function AgendaCoverages({coverages}) {
    return coverages.map((coverage) => (
        <div className='coverage-item' key={coverage.coverage_id}>
            <div className='coverage-item__row'>
                <span className='d-flex coverage-item--element-grow text-overflow-ellipsis'>
                    <i className={`icon-small--coverage-${coverage.coverage_type} ${getCoverageStatusClass(coverage)} mr-2`}></i>
                    <span className='text-overflow-ellipsis'>{coverage.coverage_type}</span>
                </span>
                <span className='d-flex'>
                    <i className='icon-small--clock icon--gray mr-1'></i>
                    <span className='coverage-item__text-label mr-1'>{gettext('due by')}:</span>
                    <span>{formatDate(coverage.scheduled)}</span>
                </span>
            </div>

            <div className='coverage-item__row'>
                {coverage.coverage_provider && <span className='coverage-item__text-label mr-1'>{gettext('Source')}:</span>}
                {coverage.coverage_provider && <span className='mr-2'>{coverage.coverage_provider}</span>}
                {coverage.coverage_status && <span className='coverage-item__text-label mr-1'>{gettext('Status')}:</span>}
                {coverage.coverage_status && <span>{coverage.news_coverage_status}</span>}
            </div>
        </div>
    ));
}

AgendaCoverages.propTypes = {
    coverages: PropTypes.array,
};