import React from 'react';
import PropTypes from 'prop-types';
import {bem} from 'ui/utils';
import {hasCoverages, hasLocation, getLocationString} from '../utils';
import AgendaListItemLabels from './AgendaListItemLabels';
import MetaTime from './MetaTime';

function AgendaListItemIcons({item, hideCoverages, row}) {
    const className = bem('wire-articles', 'item__meta', {
        row,
    });

    return (
        <div className={className}>
            <MetaTime item={item} borderRight={true} />

            {hasCoverages(item) && !hideCoverages &&
                <div className='wire-articles__item__icons wire-articles__item__icons--dashed-border align-self-start'>
                    {item.coverages.map((coverage) => {
                        const coverageClass = `icon--coverage-${coverage.coverage_type}`;
                        const statusClass = coverage.workflow_status === 'active' ? 'icon--green' : 'icon--gray-light';
                        return (<span className='wire-articles__item__icon' key={coverage.coverage_id}>
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
    hideCoverages: PropTypes.bool,
    row: PropTypes.bool,
};

export default AgendaListItemIcons;
