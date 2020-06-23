import React from 'react';
import PropTypes from 'prop-types';
import {isEmpty, get} from 'lodash';

import { gettext } from 'utils';

import { getLocations, mapsKey } from 'maps/utils';
import StaticMap from 'maps/components/static';

import PreviewActionButtons from 'components/PreviewActionButtons';

import Content from 'ui/components/Content';
import ContentBar from 'ui/components/ContentBar';
import ContentHeader from 'ui/components/ContentHeader';

import Article from 'ui/components/Article';
import ArticleBody from 'ui/components/ArticleBody';
import ArticleSidebar from 'ui/components/ArticleSidebar';
import ArticleSidebarBox from 'ui/components/ArticleSidebarBox';

import {
    hasCoverages,
    hasAttachments,
    getInternalNote,
    getCoveragesForDisplay,
} from '../utils';

import AgendaLongDescription from './AgendaLongDescription';
import AgendaMeta from './AgendaMeta';
import AgendaEdNote from './AgendaEdNote';
import AgendaInternalNote from './AgendaInternalNote';
import AgendaPreviewCoverages from './AgendaPreviewCoverages';
import AgendaAttachments from './AgendaAttachments';
import AgendaCoverageRequest from './AgendaCoverageRequest';
import AgendaTags from './AgendaTags';


export default function AgendaItemDetails(
    {
        item,
        user,
        actions,
        onClose,
        requestCoverage,
        group,
        planningId,
        eventsOnly,
        wireItems,
        coverageActions,
    })
{
    const locations = getLocations(item);
    let map = null;

    // Ta: disabling the embedded map for now for ticket SDAN-334
    // const geoLocations = getGeoLocations(locations);
    // if (mapsLoaded() && !isEmpty(geoLocations)) {
    //     map = <Map locations={geoLocations} />;
    // }
    const plan = (get(item, 'planning_items') || []).find((p) => p.guid === planningId) || {};

    if (!map && mapsKey() && !isEmpty(locations)) {
        map = <StaticMap locations={locations} scale={2} />;
    }

    const displayCoverages = getCoveragesForDisplay(item, plan, group);
    const internalNotes = getInternalNote(item, plan);

    return (
        <Content type="item-detail">
            <ContentHeader>
                <ContentBar onClose={onClose}>
                    <PreviewActionButtons item={item} user={user} actions={actions}/>
                </ContentBar>
            </ContentHeader>

            <Article image={map} item={item} group={group}>
                <ArticleBody>
                    <AgendaMeta item={item} />
                    <AgendaLongDescription item={item} plan={plan}/>
                </ArticleBody>
                <ArticleSidebar>
                    <div>
                        {hasCoverages(item) &&
                        <AgendaPreviewCoverages
                            item={item}
                            currentCoverage={displayCoverages.current}
                            previousCoverage={displayCoverages.previous}
                            wireItems={wireItems}
                            actions={coverageActions}
                            user={user} />}
                    </div>
                    {hasAttachments(item) && (
                        <ArticleSidebarBox label={gettext('Attachments')}>
                            <AgendaAttachments item={item} />
                        </ArticleSidebarBox>
                    )}
                    <AgendaTags item={item} plan={plan} isItemDetail={true} />
                    <AgendaEdNote item={item} plan={plan} secondaryNoteField='state_reason'/>
                    <AgendaInternalNote internalNote={internalNotes}
                        mt2={!!(item.ednote || plan.ednote || item.state_reason)}/>
                    {!eventsOnly && <AgendaCoverageRequest item={item} requestCoverage={requestCoverage}/>}
                </ArticleSidebar>
            </Article>
        </Content>
    );
}

AgendaItemDetails.propTypes = {
    item: PropTypes.object.isRequired,
    user: PropTypes.string.isRequired,
    actions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        action: PropTypes.func,
        url: PropTypes.func,
    })),
    onClose: PropTypes.func,
    requestCoverage: PropTypes.func,
    group: PropTypes.string,
    planningId: PropTypes.string,
    eventsOnly: PropTypes.bool,
    wireItems: PropTypes.array,
    coverageActions: PropTypes.array,
};
