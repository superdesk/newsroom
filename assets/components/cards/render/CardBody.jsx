import React from 'react';
import PropTypes from 'prop-types';
import {getSlugline, shortDate} from 'utils';
import {shortText} from 'wire/utils';
import {Embargo} from '../../../wire/components/fields/Embargo';


function CardBody({item, displayMeta, displayDescription, displaySource}) {
    return (<div className="card-body">
        <h4 className="card-title">{item.headline}</h4>

        <Embargo item={item} isCard={true} />

        {displayDescription && <div className="wire-articles__item__text">
            <p className='card-text small'>{shortText(item, 40, true)}</p>
        </div>}

        {displayMeta && (
            <div className="wire-articles__item__meta">
                <div className="wire-articles__item__meta-info">
                    <span className="bold">{getSlugline(item, true)}</span>
                    {displaySource &&
                    <span>{item.source} {'//'} </span>}
                    <span>{shortDate(item.versioncreated)}</span>
                </div>
            </div>
        )}
    </div>);
}

CardBody.propTypes = {
    item: PropTypes.object,
    displayMeta: PropTypes.bool,
    displayDescription: PropTypes.bool,
    displaySource: PropTypes.bool,
};

CardBody.defaultProps = {
    displayMeta: true,
    displayDescription: true,
    displaySource: true,
};

export default CardBody;
