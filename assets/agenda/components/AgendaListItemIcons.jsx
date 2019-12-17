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
    isRecurring,
    getInternalNote,
    getAttachments,
} from '../utils';

import AgendaListItemLabels from './AgendaListItemLabels';
import AgendaMetaTime from './AgendaMetaTime';
import AgendaInternalNote from './AgendaInternalNote';
import AgendaListCoverageItem from './AgendaListCoverageItem';

import {gettext} from 'utils';


class AgendaListItemIcons extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.getUpdatedState(props);
    }

    shouldComponentUpdate(nextProps) {
        return get(this.props, 'item._id') !== get(nextProps, 'item._id') ||
            get(this.props, 'item._etag') !== get(nextProps, 'item._etag');
    }

    componentWillReceiveProps(nextProps) {
        if (get(this.props, 'item._id') !== get(nextProps, 'item._id') ||
            get(this.props, 'item._etag') !== get(nextProps, 'item._etag')) {
            this.setState(this.getUpdatedState(nextProps));
        }
    }

    getUpdatedState(props) {
        return {
            internalNote: getInternalNote(props.item, props.planningItem),
            coveragesToDisplay: !hasCoverages(props.item) || props.hideCoverages ?
                [] :
                props.item.coverages.filter(
                    (c) => !props.group || (isCoverageForExtraDay(c, props.group) && c.planning_id === get(props, 'planningItem.guid'))
                ),
            attachments: (getAttachments(props.item)).length,
            isRecurring: isRecurring(props.item),
            hasLocation: hasLocation(props.item),
            locationString: getLocationString(props.item),
        };
    }

    render() {
        const props = this.props;
        const state = this.state;
        const className = bem('wire-articles', 'item__meta', {row: props.row});

        return (
            <div className={className}>
                <AgendaMetaTime
                    item={props.item}
                    borderRight={!props.isMobilePhone}
                    isRecurring={state.isRecurring}
                    group={props.group}
                    isMobilePhone={props.isMobilePhone}
                />

                {state.coveragesToDisplay.length > 0 && (
                    <div className='wire-articles__item__icons wire-articles__item__icons--dashed-border align-self-start'>
                        {state.coveragesToDisplay.map((coverage, index) => (
                            <AgendaListCoverageItem
                                key={index}
                                planningItem={props.planningItem}
                                user={props.user}
                                coverage={coverage}
                                showBorder={props.isMobilePhone && index === state.coveragesToDisplay.length - 1}
                                group={props.group}
                            />
                        ))}
                    </div>
                )}

                {state.attachments > 0 && (
                    <div className='wire-articles__item__icons--dashed-border align-self-start'>
                        <i className='icon-small--attachment'
                            title={gettext('{{ attachments }} file(s) attached', {attachments: state.attachments})}
                        />
                    </div>
                )}

                <div className='wire-articles__item__meta-info flex-row align-items-start'>
                    {state.hasLocation && (
                        <React.Fragment>
                            <span className='mr-2'>
                                <i className='icon-small--location icon--gray' />
                            </span>

                            {props.isMobilePhone ? (
                                <span>{state.locationString}</span>
                            ) : (
                                <span className={classNames('mr-2',
                                    {'wire-articles__item__icons--dashed-border': state.internalNote})}>
                                    {state.locationString}
                                </span>
                            )}
                        </React.Fragment>
                    )}

                    {!props.isMobilePhone && (
                        <AgendaInternalNote internalNote={state.internalNote} onlyIcon={true}/>
                    )}

                    <AgendaListItemLabels item={props.item} />
                </div>
            </div>
        );
    }
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
