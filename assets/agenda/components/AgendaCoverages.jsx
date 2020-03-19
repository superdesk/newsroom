import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { isEmpty } from 'lodash';
import { gettext } from 'utils';
import CoverageItemStatus from './CoverageItemStatus';
import {
    getDataFromCoverages,
    getCoverageDisplayName,
    getCoverageIcon,
    WORKFLOW_COLORS,
    WORKFLOW_STATUS,
    formatCoverageDate
} from '../utils';


export default function AgendaCoverages({item, coverages, wireItems, actions, user, onClick, hideViewContentItems}) {
    if (isEmpty(coverages)) {
        return null;
    }

    const getSlugline = (coverage) => {
        const slugline = coverage.item_slugline || coverage.slugline;

        return slugline ? ` | ${slugline}` : '';
    };

    return coverages.map((coverage) => (
        <div className={classNames('coverage-item',
            {'coverage-item--clickable': onClick})} key={coverage.coverage_id} onClick={onClick}
        title={onClick ? gettext('Open Agenda in new tab') : onClick} >
            <div className='coverage-item__row'>
                <span className='d-flex coverage-item--element-grow'>
                    <i className={`icon-small--coverage-${getCoverageIcon(coverage.coverage_type)} ${WORKFLOW_COLORS[coverage.workflow_status]} mr-2`}></i>
                    <span>{`${getCoverageDisplayName(coverage.coverage_type)}${getSlugline(coverage)}`}</span>
                </span>
                {coverage.workflow_status !== WORKFLOW_STATUS.COMPLETED && <span className='d-flex text-nowrap'>
                    <i className='icon-small--clock icon--gray mr-1'></i>
                    <span className='coverage-item__text-label mr-1'>{gettext('expected')}:</span>
                    <span>{formatCoverageDate(coverage)}</span>
                </span>}
            </div>
            {coverage.coverage_provider && <div className='coverage-item__row'>
                <span className='coverage-item__text-label mr-1'>{gettext('Source')}:</span>
                <span className='mr-2'>{coverage.coverage_provider}</span>
            </div>}
            <CoverageItemStatus
                coverage={coverage}
                item={item}
                wireItems={wireItems}
                actions={actions}
                user={user}
                coverageData={getDataFromCoverages(item)}
                hideViewContentItems={hideViewContentItems} />
        </div>
    ));
}

AgendaCoverages.propTypes = {
    item: PropTypes.object,
    coverages: PropTypes.arrayOf(PropTypes.object),
    wireItems: PropTypes.array,
};
