import React from 'react';
import PropTypes from 'prop-types';
import { gettext, shortDate } from 'utils';

function CardBody({item}) {
    return (<div className="card-body">
        <h4 className="card-title">{item.headline}</h4>
        <div className="wire-articles__item__text">
            <p>{item.description_text}</p>
        </div>
        <div className="wire-articles__item__meta">
            <div className="wire-articles__item__meta-info">
                <span className="bold">{item.slugline}</span>
                <span>{gettext('Source: {{ source }}', {source: item.source})} {'//'} {shortDate(item.versioncreated)}</span>
            </div>
        </div>
    </div>);
}

CardBody.propTypes = {
    item: PropTypes.object,
};

export default CardBody;