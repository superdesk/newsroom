import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { get } from 'lodash';

import { isEqualItem } from 'wire/utils';
import PreviewActionButtons from 'components/PreviewActionButtons';

import Preview from 'ui/components/Preview';

import {
    hasCoverages,
    isPostponed,
    isRescheduled,
    getInternalNote,
    getCoveragesForDisplay,
} from '../utils';
import AgendaName from './AgendaName';
import AgendaTime from './AgendaTime';
import AgendaMeta from './AgendaMeta';
import AgendaEdNote from './AgendaEdNote';
import AgendaInternalNote from './AgendaInternalNote';
import AgendaPreviewCoverages from './AgendaPreviewCoverages';
import AgendaPreviewImage from './AgendaPreviewImage';
import AgendaLongDescription from './AgendaLongDescription';
import AgendaPreviewAttachments from './AgendaPreviewAttachments';
import AgendaCoverageRequest from './AgendaCoverageRequest';
import AgendaTags from './AgendaTags';
import AgendaListItemLabels from './AgendaListItemLabels';

class AgendaPreview extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    componentDidUpdate(nextProps) {
        if (!isEqualItem(nextProps.item, this.props.item) && this.props.item) {
            this.preview.scrollTop = 0; // reset scroll on change
        }
    }

    render() {
        const {
            item,
            user,
            actions,
            openItemDetails,
            requestCoverage,
            previewGroup,
            previewPlan,
            eventsOnly,
            wireItems,
            coverageActions,
        } = this.props;

        const isWatching = get(item, 'watches', []).includes(user);

        const previewClassName = classNames('wire-column__preview', {
            'wire-column__preview--covering': hasCoverages(item),
            'wire-column__preview--not-covering': !hasCoverages(item),
            'wire-column__preview--postponed': isPostponed(item),
            'wire-column__preview--rescheduled': isRescheduled(item),
            'wire-column__preview--open': !!item,
            'wire-column__preview--watched': isWatching,
        });

        const plan = (get(item, 'planning_items') || []).find((p) => p.guid === previewPlan) || {};
        const displayCoverages = getCoveragesForDisplay(item, plan, previewGroup);
        const previewInnerElement = (<AgendaListItemLabels item={item} />);

        return (
            <div className={previewClassName}>
                {item &&
                    <Preview onCloseClick={this.props.closePreview} published={item.versioncreated} innerElements={previewInnerElement}>
                        <div className='wire-column__preview__top-bar'>
                            <PreviewActionButtons item={item} user={user} actions={actions} plan={previewPlan} group={previewGroup} />
                        </div>

                        <div id='preview-article' className='wire-column__preview__content pt-0 noselect' ref={(preview) => this.preview = preview}>
                            <AgendaName item={item} />
                            <AgendaTime item={item} group={previewGroup} />
                            <AgendaPreviewImage item={item} onClick={openItemDetails} />
                            <AgendaMeta item={item} />
                            <AgendaLongDescription item={item} plan={plan}/>
                            <AgendaPreviewCoverages item={item}
                                currentCoverage={displayCoverages.current}
                                previousCoverage={displayCoverages.previous}
                                wireItems={wireItems}
                                actions={coverageActions}
                                user={user}
                            />
                            <AgendaPreviewAttachments item={item} />
                            <AgendaTags item={item} plan={plan} isItemDetail={false} />
                            <AgendaEdNote item={item} plan={plan} secondaryNoteField='state_reason' />
                            <AgendaInternalNote internalNote={getInternalNote(item, plan)}
                                mt2={!!(item.ednote || plan.ednote || item.state_reason)} />
                            {!eventsOnly && <AgendaCoverageRequest item={item} requestCoverage={requestCoverage}/>}
                        </div>
                    </Preview>
                }
            </div>
        );
    }
}

AgendaPreview.propTypes = {
    user: PropTypes.string,
    item: PropTypes.object,
    actions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        action: PropTypes.func,
        url: PropTypes.func,
    })),
    followEvent: PropTypes.func,
    closePreview: PropTypes.func,
    openItemDetails: PropTypes.func,
    requestCoverage: PropTypes.func,
    previewGroup: PropTypes.string,
    previewPlan: PropTypes.string,
    eventsOnly: PropTypes.bool,
    wireItems: PropTypes.array,
    coverageActions: PropTypes.array,
};

AgendaPreview.defaultProps = {eventsOnly: false};

export default AgendaPreview;
