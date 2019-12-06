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
    isCoverageBeingUpdated,
    getCoverageStatusText,
    isWatched,
} from '../utils';

import AgendaListItemLabels from './AgendaListItemLabels';
import AgendaMetaTime from './AgendaMetaTime';
import AgendaInternalNote from './AgendaInternalNote';
import {gettext, formatDate, formatTime} from 'utils';


const getCoverageTootip = (coverage, beingUpdated) => {
    let slugline = coverage.item_slugline || coverage.slugline;

    slugline =  gettext(' coverage{{slugline}}', {slugline: slugline ? ` '${slugline}'` : ''}) ;

    if (coverage.workflow_status === WORKFLOW_STATUS.DRAFT) {
        return gettext('{{ type }}{{ slugline }} {{ status_text }}', {
            type: getCoverageDisplayName(coverage.coverage_type),
            slugline: slugline,
            status_text: getCoverageStatusText(coverage)
        });
    }

    if (['assigned'].includes(coverage.workflow_status)) {
        return gettext('Planned {{ type }} {{ slugline }}, expected {{date}} at {{time}}', {
            type: getCoverageDisplayName(coverage.coverage_type),
            slugline: slugline,
            date: formatDate(coverage.scheduled),
            time: formatTime(coverage.scheduled)
        });
    }

    if (['active'].includes(coverage.workflow_status)) {
        return gettext('{{ type }} {{ slugline }} in progress, expected {{date}} at {{time}}', {
            type: getCoverageDisplayName(coverage.coverage_type),
            slugline: slugline,
            date: formatDate(coverage.scheduled),
            time: formatTime(coverage.scheduled)
        });
    }

    if (coverage.workflow_status === WORKFLOW_STATUS.CANCELLED) {
        return gettext('{{ type }} {{slugline}} cancelled', {
            type: getCoverageDisplayName(coverage.coverage_type),
            slugline: slugline,
        });
    }

    if (coverage.workflow_status === WORKFLOW_STATUS.COMPLETED) {
        let deliveryState;
        if (get(coverage, 'deliveries.length', 0) > 1) {
            deliveryState = beingUpdated ? gettext(' (update to come)') : gettext(' (updated)');
        }

        return gettext('{{ type }} {{ slugline }} available{{deliveryState}}', {
            type: getCoverageDisplayName(coverage.coverage_type),
            slugline: slugline,
            deliveryState: deliveryState
        });
    }

    return '';
};

function AgendaListItemIcons({item, planningItem, group, hideCoverages, row, isMobilePhone, user}) {
    const className = bem('wire-articles', 'item__meta', {row});
    const internalNote = getInternalNote(item, planningItem);
    const coveragesToDisplay = !hasCoverages(item) || hideCoverages ?
        [] :
        item.coverages.filter(
            (c) =>!group || (isCoverageForExtraDay(c, group) && c.planning_id === get(planningItem, 'guid'))
        );
    const attachments = (getAttachments(item)).length;

    return (
        <div className={className}>
            <AgendaMetaTime
                item={item}
                borderRight={!isMobilePhone}
                isRecurring={isRecurring(item)}
                group={group}
                isMobilePhone={isMobilePhone}
            />

            {coveragesToDisplay.length > 0 &&
                <div className='wire-articles__item__icons wire-articles__item__icons--dashed-border align-self-start'>
                    {coveragesToDisplay.map((coverage, index) => {
                        const coverageClass = `icon--coverage-${getCoverageIcon(coverage.coverage_type)}`;
                        const beingUpdated = isCoverageBeingUpdated(coverage);
                        const showBorder = isMobilePhone && index === coveragesToDisplay.length - 1;

                        return (!group || (isCoverageForExtraDay(coverage, group) &&
                            coverage.planning_id === get(planningItem, 'guid')) &&
                          <span
                              className={classNames('wire-articles__item__icon', {'dashed-border': showBorder})}
                              key={coverage.coverage_id}
                              title={getCoverageTootip(coverage, beingUpdated)}
                          >
                              <i className={`${coverageClass} ${WORKFLOW_COLORS[coverage.workflow_status]}`}>
                                  {beingUpdated && <i className="blue-circle" />}
                                  {isWatched(coverage, user) &&
                                    <i className="icon--watched coverage--secondary-icon icon--gray-light" />}
                              </i>
                          </span>);
                    })}
                </div>
            }
            {attachments > 0 && (
                <div className='wire-articles__item__icons--dashed-border align-self-start'>
                    <i className='icon-small--attachment'
                        title={gettext('{{ attachments }} file(s) attached', {attachments: attachments})}
                    />
                </div>
            )}
            <div className='wire-articles__item__meta-info flex-row align-items-start'>
                {hasLocation(item) && (
                    <span className='mr-2'>
                        <i className='icon-small--location icon--gray' />
                    </span>
                )}
                {hasLocation(item) && !isMobilePhone && (
                    <span className={classNames('mr-2',
                        {'wire-articles__item__icons--dashed-border' :internalNote})}>
                        {getLocationString(item)}
                    </span>
                )}
                {hasLocation(item) && isMobilePhone && (
                    <span>{getLocationString(item)}</span>
                )}

                {!isMobilePhone && (
                    <AgendaInternalNote internalNote={internalNote} onlyIcon={true}/>
                )}

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
    isMobilePhone: PropTypes.bool,
    user: PropTypes.string,
};

AgendaListItemIcons.defaultProps = {isMobilePhone: false};

export default AgendaListItemIcons;
