import React from 'react';
import PropTypes from 'prop-types';
import {isEmpty} from 'lodash';

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

import { hasCoverages, hasAttachments } from '../utils';

import AgendaLongDescription from './AgendaLongDescription';
import AgendaMeta from './AgendaMeta';
import AgendaEdNote from './AgendaEdNote';
import AgendaCoverages from './AgendaCoverages';
import AgendaAttachments from './AgendaAttachments';
import AgendaCoverageRequest from './AgendaCoverageRequest';

export default function AgendaItemDetails({item, user, actions, onClose, requestCoverage, group}) {
    const locations = getLocations(item);
    let map = null;

    // Ta: disabling the embedded map for now for ticket SDAN-334
    // const geoLocations = getGeoLocations(locations);
    // if (mapsLoaded() && !isEmpty(geoLocations)) {
    //     map = <Map locations={geoLocations} />;
    // }

    if (!map && mapsKey() && !isEmpty(locations)) {
        map = <StaticMap locations={locations} scale={2} />;
    }

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
                    <AgendaLongDescription item={item} />
                </ArticleBody>
                <ArticleSidebar>
                    <ArticleSidebarBox label={gettext('Coverages')}>
                        {hasCoverages(item) && <AgendaCoverages coverages={item.coverages} />}
                        <AgendaCoverageRequest item={item} requestCoverage={requestCoverage}/>
                    </ArticleSidebarBox>
                    {hasAttachments(item) && (
                        <ArticleSidebarBox label={gettext('Attachments')}>
                            <AgendaAttachments item={item} />
                        </ArticleSidebarBox>
                    )}
                    <AgendaEdNote item={item} />
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
};
