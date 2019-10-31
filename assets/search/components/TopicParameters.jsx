import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {get, keyBy} from 'lodash';

import {gettext, formatDate} from 'utils';

const TopicParameters = ({topic, navigations, locators}) => {
    const filters = get(topic, 'filter') || {};
    const navsById = keyBy(navigations, '_id');
    const navs = (get(topic, 'navigation') || [])
        .map((navId) => get(navsById, `[${navId}].name`));

    const created = get(topic, 'created') || {};
    let dateLabels;

    if (created.to) {
        dateLabels = [
            gettext('From: {{date}}', {date: formatDate(created.from)}),
            gettext('To: {{date}}', {date: formatDate(created.to)}),
        ];
    } else if (created.from) {
        if (created.from === 'now/d') {
            dateLabels = [gettext('Today')];
        } else if (created.from === 'now/w') {
            dateLabels = [gettext('This week')];
        } else if (created.from === 'now/M') {
            dateLabels = [gettext('This month')];
        }
    } else {
        dateLabels = [];
    }

    const renderParam = (name, items) => get(items, 'length', 0) < 1 ? null : (
        <div className="info-box__content">
            <span className="wire-column__preview__tags__headline">
                {name}
            </span>
            {items.map((item) => (
                <span className="wire-column__preview__tag" key={item.toString().replace(/\s+/g, '_')}>
                    {item}
                </span>
            ))}
        </div>
    );

    const renderPlace = () => {
        if (get(filters, 'place.length', 0) < 1) {
            return null;
        }

        const getPlaceName = (placeId) => {
            let region = (Object.values(locators) || []).find((l) => l.name === placeId);
            return region ?
                (get(region, 'state') || get(region, 'country') || get(region, 'world_region')) :
                placeId;
        };
        const places = (get(filters, 'place') || []).map(getPlaceName);

        return renderParam(gettext('Place'), places);
    };

    return (
        <div className="my-topics__form-params ">
            {renderParam(gettext('Search'), get(topic, 'query') ? [topic.query] : [])}
            {renderParam(gettext('Date Created'), dateLabels)}
            {renderParam(gettext('Topics'), navs)}
            {renderParam(gettext('Category'), filters.service)}
            {renderParam(gettext('Subject'), filters.subject)}
            {renderParam(gettext('Content Type'), filters.genre)}
            {renderParam(gettext('Urgency'), filters.urgency)}
            {renderPlace()}
            {renderParam(gettext('Calendar'), filters.calendar)}
            {renderParam(gettext('Coverage Type'), filters.coverage)}
            {renderParam(gettext('Coverage Status'), filters.coverage_status)}
            {renderParam(gettext('Location'), filters.location)}
        </div>
    );
};

TopicParameters.propTypes = {
    topic: PropTypes.object,
    navigations: PropTypes.arrayOf(PropTypes.object),
    locators: PropTypes.array,
};

const mapStateToProps = (state) => ({
    locators: get(state, 'locators.items', []),
});

export default connect(mapStateToProps, null)(TopicParameters);
