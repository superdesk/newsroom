import React from 'react';
import PropTypes from 'prop-types';
import {get} from 'lodash';
import {bem} from 'ui/utils';
import classNames from 'classnames';
import {
    hasCoverages,
    isCoverageForExtraDay,
    hasLocation,
    getLocationString,
    getCoverageIcon,
    isRecurring,
    getInternalNote,
    WORKFLOW_COLORS,
    WORKFLOW_STATUS,
    getCoverageDisplayName,
    getAttachments,
} from '../utils';

import AgendaListItemLabels from './AgendaListItemLabels';
import AgendaMetaTime from './AgendaMetaTime';
import AgendaInternalNote from './AgendaInternalNote';
import {gettext, formatDate, formatTime} from 'utils';


function AgendaListItemIcons({item, planningItem, group, hideCoverages, row}) {
    const className = bem('wire-articles', 'item__meta', {
        row,
    });

    const getCoverageTootip = (coverage) => {
        let slugline = coverage.item_slugline || coverage.slugline;

        slugline = slugline ? ` '${slugline}'` : '';
        if (coverage.workflow_status === WORKFLOW_STATUS.DRAFT) {
            return gettext('Planned {{ type }} coverage{{ slugline }}', {
                type: getCoverageDisplayName(coverage.coverage_type),
                slugline: slugline,
            });
        }

        if (['assigned'].includes(coverage.workflow_status)) {
            return gettext('Planned {{ type }} coverage {{ slugline }}, expected {{date}} at {{time}}', {
                type: getCoverageDisplayName(coverage.coverage_type),
                slugline: slugline,
                date: formatDate(coverage.scheduled),
                time: formatTime(coverage.scheduled)
            });
        }

        if (['active'].includes(coverage.workflow_status)) {
            return gettext('{{ type }} coverage {{ slugline }} in progress, expected {{date}} at {{time}}', {
                type: getCoverageDisplayName(coverage.coverage_type),
                slugline: slugline,
                date: formatDate(coverage.scheduled),
                time: formatTime(coverage.scheduled)
            });
        }

        if (coverage.workflow_status === WORKFLOW_STATUS.CANCELLED) {
            return gettext('{{ type }} coverage {{slugline}} cancelled', {
                type: getCoverageDisplayName(coverage.coverage_type),
                slugline: slugline,
            });
        }

        if (coverage.workflow_status === WORKFLOW_STATUS.COMPLETED) {
            return gettext('{{ type }} coverage{{ slugline }} available', {
                type: getCoverageDisplayName(coverage.coverage_type),
                slugline: slugline,
            });
        }

        return '';
    };

    const internalNote = getInternalNote(item, planningItem);
    const coveragesToDisplay = !hasCoverages(item) || hideCoverages ? [] :
        item.coverages.filter((c) =>!group || (isCoverageForExtraDay(c, group) && c.planning_id === get(planningItem, 'guid')));
    const attachments = (getAttachments(item)).length;

    return (
        <div className={className}>
            <AgendaMetaTime
                item={item}
                borderRight={true}
                isRecurring={isRecurring(item)}
                group={group}
            />

            {coveragesToDisplay.length > 0 &&
                <div className='wire-articles__item__icons wire-articles__item__icons--dashed-border align-self-start'>
                    {coveragesToDisplay.map((coverage) => {
                        const coverageClass = `icon--coverage-${getCoverageIcon(coverage.coverage_type)}`;
                        return (!group || (isCoverageForExtraDay(coverage, group) &&
                            coverage.planning_id === get(planningItem, 'guid')) &&
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
            {attachments > 0 && <div className='wire-articles__item__icons--dashed-border align-self-start'>
                <i className='icon-small--attachment' title={gettext('{{ attachments }} file(s) attached', {attachments: attachments})} />
            </div>}
            <div className='wire-articles__item__meta-info flex-row align-items-start'>
                {hasLocation(item) && <span className='mr-2'>
                    <i className='icon-small--location icon--gray'></i>
                </span>}
                {hasLocation(item) &&
                    <span className={classNames({'wire-articles__item__icons--dashed-border' :internalNote})}>
                        {getLocationString(item)}
                    </span>}
                <AgendaInternalNote
                    internalNote={internalNote}
                    onlyIcon={true} />

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
