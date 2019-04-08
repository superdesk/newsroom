import React from 'react';
import PropTypes from 'prop-types';
import {getScheduleType} from 'utils';
import {bem} from '../utils';
import {hasCoverages, SCHEDULE_TYPE} from '../../agenda/utils';
import AgendaName from '../../agenda/components/AgendaName';
import AgendaMap from '../../agenda/components/AgendaMap';
import AgendaTime from '../../agenda/components/AgendaTime';
import AgendaListItemLabels from '../../agenda/components/AgendaListItemLabels';

export default function Article({image, item, group, children}) {
    const itemLabel = (<AgendaListItemLabels
        item={item}
        withDate={getScheduleType(item) !== SCHEDULE_TYPE.ALL_DAY}
        group={group} />);
    return (
        <article id='preview-article' className="wire-column__preview__content--item-detail-wrap">
            <div className={bem('wire-column__preview', 'content', {covering: hasCoverages(item)})}>
                <AgendaName item={item} />
                <AgendaTime item={item} group={group} suppliedNodes={itemLabel} withGroupDate={false} />

                <AgendaMap image={image} />
                <div className="wire-column__preview__content--item-detail-text-wrap">
                    {children}
                </div>
            </div>
        </article>
    );
}

Article.propTypes = {
    image: PropTypes.element,
    item: PropTypes.object,
    group: PropTypes.string,
    children: PropTypes.node,
};