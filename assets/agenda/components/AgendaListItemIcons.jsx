import React from 'react';
import PropTypes from 'prop-types';
import {bem} from 'ui/utils';
import {
    hasCoverages,
    isCoverageForExtraDay,
    hasLocation,
    getLocationString,
    getCoverageIcon,
    isRecurring
} from '../utils';

import AgendaListItemLabels from './AgendaListItemLabels';
import {gettext, formatDate, formatTime} from 'utils';
import MetaTime from 'ui/components/MetaTime';


function AgendaListItemIcons({item, group, hideCoverages, row}) {
    const className = bem('wire-articles', 'item__meta', {
        row,
    });

    const getCoverageTootip = (coverage) => {

        const status = {
            draft: 'planned',
            assigned: 'planned',
            active: 'in progress',
            completed: 'available',
        };

        if (['draft', 'assigned', 'active'].includes(coverage.workflow_status)) {
            return gettext('{{ type }} coverage {{ status }}, due {{date}} at {{time}}', {
                type: coverage.coverage_type,
                status: status[coverage.workflow_status],
                date: formatDate(coverage.scheduled),
                time: formatTime(coverage.scheduled)
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
            <MetaTime
                date={item.dates.start}
                borderRight={true}
                isRecurring={isRecurring(item)}
                cssClass={bem('time-label', null, {covering: hasCoverages(item)})}
            />

            {hasCoverages(item) && !hideCoverages &&
                <div className='wire-articles__item__icons wire-articles__item__icons--dashed-border align-self-start'>
                    {item.coverages.map((coverage) => {
                        const coverageClass = `icon--coverage-${getCoverageIcon(coverage.coverage_type)}`;
                        const statusClass = coverage.workflow_status === 'active' ? 'icon--green' : 'icon--gray-light';
                        return (!group || isCoverageForExtraDay(coverage, group) &&
                          <span
                              className='wire-articles__item__icon'
                              key={coverage.coverage_id}
                              title={getCoverageTootip(coverage)}>
                              <i className={`${coverageClass} ${statusClass}`}></i>
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
    group: PropTypes.string,
    hideCoverages: PropTypes.bool,
    row: PropTypes.bool,
};

export default AgendaListItemIcons;
