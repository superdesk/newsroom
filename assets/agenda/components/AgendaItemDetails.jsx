import React from 'react';
import PropTypes from 'prop-types';
import {isEmpty} from 'lodash';

import { gettext } from 'utils';

import { getLocations, mapsLoaded, getGeoLocations, mapsKey } from 'maps/utils';
import Map from 'maps/components/map';
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

import AgendaTime from './AgendaTime';
import AgendaName from './AgendaName';
import AgendaLongDescription from './AgendaLongDescription';
import AgendaMeta from './AgendaMeta';
import AgendaEdNote from './AgendaEdNote';
import AgendaCoverages from './AgendaCoverages';
import AgendaAttachments from './AgendaAttachments';

export default function AgendaItemDetails({item, user, actions, onClose}) {
    const locations = getLocations(item);
    const geoLocations = getGeoLocations(locations);
    let map = null;

    if (mapsLoaded() && !isEmpty(geoLocations)) {
        map = <Map locations={geoLocations} />;
    }

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

            <Article image={map} covering={hasCoverages(item)}>
                <ArticleBody>
                    <AgendaTime item={item} />
                    <AgendaName item={item} />
                    <AgendaMeta item={item} />
                    <AgendaLongDescription item={item} />
                </ArticleBody>
                <ArticleSidebar>
                    {hasCoverages(item) && (
                        <ArticleSidebarBox label={gettext('Coverages')}>
                            <AgendaCoverages coverages={item.coverages} />
                        </ArticleSidebarBox>
                    )}
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
};
