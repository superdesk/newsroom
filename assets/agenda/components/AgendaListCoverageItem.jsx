import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {get, isEqual} from 'lodash';

import {formatDate, formatTime, gettext} from '../../utils';
import {
    getCoverageDisplayName,
    getCoverageIcon,
    getCoverageStatusText,
    isCoverageBeingUpdated,
    isCoverageForExtraDay,
    isWatched,
    WORKFLOW_COLORS,
    WORKFLOW_STATUS,
} from '../utils';

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

class AgendaListCoverageItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.getUpdatedState(props);
    }

    shouldComponentUpdate(nextProps) {
        return !isEqual(this.props.coverage, nextProps.coverage);
    }

    componentWillReceiveProps(nextProps) {
        if (!isEqual(this.props.coverage, nextProps.coverage)) {
            this.setState(this.getUpdatedState(nextProps));
        }
    }

    getUpdatedState(props) {
        const watched = isWatched(props.coverage, props.user);

        const state = {
            coverageClass: `icon--coverage-${getCoverageIcon(props.coverage.coverage_type)}`,
            beingUpdated: isCoverageBeingUpdated(props.coverage),
            isWatched: watched,
            watchText: watched ? gettext('(Watching)') : '',
            isCoverageForExtraDay: isCoverageForExtraDay(props.coverage, props.group),
        };

        state.tooltip = `${state.watchText} ${getCoverageTootip(props.coverage, state.beingUpdated)}`;

        return state;
    }

    render() {
        const props = this.props;
        const state = this.state;

        return (!props.group ||
            (state.isCoverageForExtraDay && props.coverage.planning_id === get(props, 'planningItem.guid'))
        ) && (
            <span
                className={classNames('wire-articles__item__icon', {'dashed-border': props.showBorder})}
                title={state.tooltip}
            >
                <i className={`${state.coverageClass} ${WORKFLOW_COLORS[props.coverage.workflow_status]}`}>
                    {state.beingUpdated && <i className="blue-circle" />}
                    {state.isWatched &&
                      <i className="blue-circle blue-circle--pale blue-circle--right" />}
                </i>
            </span>
        );
    }
}

AgendaListCoverageItem.propTypes = {
    planningItem: PropTypes.object,
    user: PropTypes.string,
    coverage: PropTypes.object,
    showBorder: PropTypes.bool,
    group: PropTypes.string,
};

export default AgendaListCoverageItem;
