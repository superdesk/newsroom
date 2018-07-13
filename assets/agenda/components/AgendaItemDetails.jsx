import React from 'react';
import PropTypes from 'prop-types';
import {isEmpty} from 'lodash';

import { getLocations } from 'maps/utils';
import Map from 'maps/components/map';

import PreviewActionButtons from 'components/PreviewActionButtons';

import Content from 'ui/components/Content';
import ContentBar from 'ui/components/ContentBar';
import ContentHeader from 'ui/components/ContentHeader';

import Article from 'ui/components/Article';
import ArticleBody from 'ui/components/ArticleBody';
import ArticleSidebar from 'ui/components/ArticleSidebar';

import {hasCoverages} from '../utils';

import AgendaTime from './AgendaTime';
import AgendaName from './AgendaName';
import AgendaLongDescription from './AgendaLongDescription';
import AgendaMeta from './AgendaMeta';
import AgendaEdNote from './AgendaEdNote';
import AgendaDetailCoverages from './AgendaDetailCoverages';

export default function AgendaItemDetails({item, user, actions, onClose}) {
    const locations = getLocations(item);
    const map = !isEmpty(locations) && window.mapsLoaded && <Map locations={locations} />;

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
                    <AgendaDetailCoverages item={item} />
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
