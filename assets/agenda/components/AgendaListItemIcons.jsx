import React from 'react';
import PropTypes from 'prop-types';
import {bem} from 'ui/utils';
import {
    hasCoverages,
    isCoverageForExtraDay,
    hasLocation,
    getLocationString,
    getCoverageIcon,
    isRecurring,
    WORKFLOW_STATUS_TEXTS,
    WORKFLOW_COLORS,
    DRAFT_STATUS_TEXTS,
} from '../utils';

import AgendaListItemLabels from './AgendaListItemLabels';
import AgendaMetaTime from './AgendaMetaTime';
import {gettext, formatDate, formatTime} from 'utils';


function AgendaListItemIcons({item, planningItem, group, hideCoverages, row}) {
    const className = bem('wire-articles', 'item__meta', {
        row,
    });

    const getCoverageTootip = (coverage) => {

        if (coverage.workflow_status === 'draft') {
            return gettext('{{ type }} coverage {{ status }}', {
                type: coverage.coverage_type,
                status: DRAFT_STATUS_TEXTS[coverage.coverage_status]
            });
        }

        if (['assigned', 'active'].includes(coverage.workflow_status)) {
            return gettext('{{ type }} coverage {{ status }}, due {{date}} at {{time}}', {
                type: coverage.coverage_type,
                status: WORKFLOW_STATUS_TEXTS[coverage.workflow_status],
                date: formatDate(coverage.scheduled),
                time: formatTime(coverage.scheduled)
            });
        }

        if (coverage.workflow_status === 'cancelled') {
            return gettext('{{ type }} coverage cancelled', {
                type: coverage.coverage_type
            });
        }

        if (coverage.workflow_status === 'completed') {
            return gettext('{{ type }} coverage available', {
                type: coverage.coverage_type
            });
        }

        return '';
    };



    return (
        <div className={className}>
            <AgendaMetaTime
                item={item}
                borderRight={true}
                isRecurring={isRecurring(item)}
                group={group}
            />

            {hasCoverages(item) && !hideCoverages &&
                <div className='wire-articles__item__icons wire-articles__item__icons--dashed-border align-self-start'>
                    {item.coverages.map((coverage) => {
                        const coverageClass = `icon--coverage-${getCoverageIcon(coverage.coverage_type)}`;
                        return (!group || (isCoverageForExtraDay(coverage, group) &&
                            coverage.planning_id === planningItem._id) &&
                          <span
                              className='wire-articles__item__icon'
                              key={coverage.coverage_id}
                              title={getCoverageTootip(coverage)}>
                              <i className={`${coverageClass} ${WORKFLOW_COLORS[coverage.workflow_status]}`}></i>
                          </span>);
                    })
                    }
                </div>
            }

            <div className='wire-articles__item__meta-info flex-row align-items-start'>
                {hasLocation(item) && <span className='mr-2'>
                    <i className='icon-small--location icon--gray'></i>
                </span>}
                {hasLocation(item) && <span>{getLocationString(item)}</span>}

                <AgendaListItemLabels item={item} />
            </div>
        </div>
    );
}

AgendaListItemIcons.propTypes = {
    item: PropTypes.object,
    planningItem: PropTypes.object,
    group: PropTypes.string,
    hideCoverages: PropTypes.bool,
    row: PropTypes.bool,
};

export default AgendaListItemIcons;
