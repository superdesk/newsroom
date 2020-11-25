import React from 'react';
import PropTypes from 'prop-types';
import {gettext} from 'utils';

function getHighlightColorForUrgency(item, listConfig) {
    return item.urgency > 0 &&
        listConfig &&
        listConfig.highlights &&
        listConfig.highlights.urgency &&
        listConfig.highlights.urgency.length >= item.urgency
        ? listConfig.highlights.urgency[item.urgency - 1]
        : null;
}

export function UrgencyItemBorder({item, listConfig}) {
    const urgencyHighlightColor = getHighlightColorForUrgency(item, listConfig);

    if (!urgencyHighlightColor) {
        return null;
    }

    return <span
        style={{
            width: '4px',
            backgroundColor: urgencyHighlightColor,
            position: 'absolute',
            height: '100%',
            zIndex: 1,
        }}
    ></span>;
}

UrgencyItemBorder.propTypes = {
    item: PropTypes.object,
    listConfig: PropTypes.object,
};

const DEFAULT_URGENCY = 4;

export function UrgencyLabel ({item, listConfig, alwaysShow = false}) {
    const urgencyHighlightColor = getHighlightColorForUrgency(item, listConfig);

    if (!urgencyHighlightColor && alwaysShow) {
        return <span>
            {gettext('News Value: {{ value }}', {
                value: item.urgency || DEFAULT_URGENCY,
            })}
        </span>;
    } else if (!urgencyHighlightColor && !alwaysShow) {
        return null;
    }

    return (
        <span
            className={'label label-rounded label-rounded--urgency mr-2 mb-1'}
            style={{
                color: urgencyHighlightColor,
                backgroundColor: urgencyHighlightColor + '20', // color + alpha channel
            }}
        >
            {gettext('urgency')} {item.urgency}
        </span>
    );
}

UrgencyLabel.propTypes = {
    item: PropTypes.object,
    listConfig: PropTypes.object,
    alwaysShow: PropTypes.bool,
};
