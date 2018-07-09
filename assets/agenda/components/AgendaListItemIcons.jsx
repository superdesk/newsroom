import React from 'react';
import PropTypes from 'prop-types';
import {formatTime} from 'utils';
import {hasCoverages, hasLocation, getLocationString, isRecurring} from '../utils';
import AgendaListItemLabels from './AgendaListItemLabels';

function AgendaListItemIcons({item}) {
    return (
        <div className='wire-articles__item__meta'>
            <div className='wire-articles__item__meta-time wire-articles__item__meta-time--border-right'>
                <span className='time-label'>{formatTime(item.dates.start)}</span>
                {isRecurring(item) && <span className='time-icon'><i className='icon-small--repeat'></i></span>}
            </div>

            {hasCoverages(item) &&
                <div className='wire-articles__item__icons wire-articles__item__icons--dashed-border align-self-start'>
                    {item.coverages.map((coverage) => {
                        const coverageClass = `icon--coverage-${coverage.coverage_type}`;
                        const statusClass = coverage.workflow_status === 'active' ? 'icon--green' : 'icon--gray-light';
                        return (<span className='wire-articles__item__icon' key={coverage.coverage_type}>
                            <i className={`${coverageClass} ${statusClass}`}></i>
                        </span>);
                    })
                    }
                </div>
            }

            {hasLocation(item) && <div className='wire-articles__item__meta-info flex-row align-items-start'>
                <span className='mr-2'>
                    <i className='icon-small--location icon--gray'></i>
                </span>
                <span>{getLocationString(item)}</span>

                <AgendaListItemLabels item={item} />
            </div>}
        </div>
    );
}

AgendaListItemIcons.propTypes = {
    item: PropTypes.object,
};

export default AgendaListItemIcons;
