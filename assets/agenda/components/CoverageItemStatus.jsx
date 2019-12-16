import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { gettext } from 'utils';
import {
    getCoverageStatusText,
    WORKFLOW_STATUS,
    isCoverageBeingUpdated,
    getNotesFromCoverages,
    isWatched,
} from '../utils';

import AgendaInternalNote from './AgendaInternalNote';
import AgendaEdNote from './AgendaEdNote';
import ActionButton from 'components/ActionButton';

function getDeliveryHref(coverage) {
    return get(coverage, 'delivery_href');
}

function getDeliveryId(coverage) {
    return get(coverage, 'delivery_id');
}

export default class CoverageItemStatus extends React.Component {
    constructor(props) {
        super(props);
        this.state = { wireItem: null };
        this.filterActions = this.filterActions.bind(this);
    }

    componentDidMount() {
        this.setWireItem(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.setWireItem(nextProps);
    }

    getInternalNotes() {
        return getNotesFromCoverages(this.props.item);
    }

    setWireItem(props) {
        const wireId = getDeliveryId(props.coverage);
        if (wireId && get(props, 'wireItems.length', 0) > 0) {
            this.setState({ wireItem: props.wireItems.find((w) => w._id === wireId) });
        }
    }

    getItemText() {
        if (this.state.wireItem) {
            return this.state.wireItem.description_text ||
                this.state.wireItem.headline ||
                this.state.wireItem.slugline;
        }

        return '';
    }

    getStatusContent(coverage) {
        const actionsToShow = this.filterActions();
        const parentWatched = isWatched(this.props.item, this.props.user);
        const actions = actionsToShow.map((action) =>
            <span className="coverage-item--element-grow" key="action-button">
                <ActionButton
                    key={action.name}
                    item={coverage}
                    className='icon-button'
                    action={action}
                    plan={this.props.item}
                    isVisited={parentWatched}
                    disabled={parentWatched}
                />
            </span>);

        let content = [
            (<span key="topRow">
                <span key="label" className='coverage-item__text-label mr-1'>{gettext('Status')}:</span>
                <span key="value">{gettext('coverage {{ state }} ',
                    {state: getCoverageStatusText(coverage)})}</span>
            </span>),
            actions
        ];

        if (coverage.workflow_status === WORKFLOW_STATUS.COMPLETED &&
            ['video', 'video_explainer', 'picture'].includes(coverage.coverage_type) && getDeliveryHref(coverage)) {
            content.push(
                <span key="contentLink" className="label label--available">
                    <a  href={coverage.delivery_href}
                        className="wire-column__preview__coverage__available-story"
                        target="_blank"
                        title={gettext('Open in new tab')}>
                        {gettext('View Content')}
                    </a>
                </span>
            );
        }

        if (coverage.workflow_status === WORKFLOW_STATUS.COMPLETED && this.state.wireItem) {
            content.push(
                this.state.wireItem._access
                    ? <span key="contentLink" className="label label--available">
                        <a className="wire-column__preview__coverage__available-story"
                            key="value"
                            href={'/wire?item='+ get(coverage, 'delivery_id')}
                            target="_blank"
                            title={gettext('Open in new tab')}>
                            {gettext('View Content')}
                        </a></span>
                    : <span key="contentLink" className="label label--restricted">
                        <a className="wire-column__preview__coverage__restricted-story"
                            key="value" href="#"
                            target="_blank">{gettext('View Content')}</a></span>
            );
        }

        return content;
    }

    getEdNoteToDisplay() {
        if (get(this.state.wireItem, 'ednote')) {
            return this.state.wireItem.ednote;
        }

        const edNotes = getNotesFromCoverages();
        return get(edNotes, this.props.coverage.coverage_id);
    }

    filterActions() {
        return this.props.actions.filter((action) => !action.when ||
            action.when(this.props.coverage, this.props.user, this.props.item));
    }

    render() {
        const internalNotes = this.getInternalNotes();
        const edNote = this.getEdNoteToDisplay();
        const coverage = this.props.coverage;
        const wireText = this.getItemText(coverage);

        return (
            <Fragment>
                {wireText && <div className='coverage-item__row'>
                    <p className='wire-articles__item__text m-0'>{wireText}</p>
                </div>}
                {isCoverageBeingUpdated(coverage) && (
                    <div className='coverage-item__row'>
                        <span className='label label--blue'>{gettext('Update coming')}</span>
                    </div>                
                )}
                <div className='coverage-item__row'>{this.getStatusContent(coverage)}</div>

                {edNote && <div className='coverage-item__row'>
                    <AgendaEdNote item={{ednote: edNote}} noMargin/>
                </div>}

                {get(internalNotes, coverage.coverage_id) && <div className='coverage-item__row'>
                    <AgendaInternalNote internalNote={internalNotes[coverage.coverage_id]} noMargin />
                </div>}
            </Fragment>
        );
    }
}

CoverageItemStatus.propTypes = {
    item: PropTypes.object,
    coverage: PropTypes.object,
    wireItems: PropTypes.array,
    actions: PropTypes.array,
    user: PropTypes.string,
};

CoverageItemStatus.defaultProps = { actions: [] };
