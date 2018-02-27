import React from 'react';
import PropTypes from 'prop-types';
import { gettext, shortDate, fullDate } from 'utils';

function CardFooter({wordCount, pictureAvailable, source, versioncreated}) {
    return (<div className="card-footer">
        <div className="wire-articles__item__meta">
            <div className="wire-articles__item__icons">
                <span className="wire-articles__item__icon">
                    <i className="icon--text icon--gray-light"></i>
                </span>
                {pictureAvailable && <span className="wire-articles__item__icon">
                    <i className="icon--photo icon--gray-light"></i>
                </span>}
            </div>
            <div className="wire-articles__item__meta-info">
                <span>
                    {source && gettext('Source: {{ source }}', {source}) + ' // '}
                    <span className='bold'>{wordCount}</span> {gettext('words')}
                    {versioncreated && ' // '}
                    {versioncreated &&
                        <time dateTime={fullDate(versioncreated)}>{shortDate(versioncreated)}</time>
                    }
                </span>
            </div>
        </div>
    </div>);
}

CardFooter.propTypes = {
    wordCount: PropTypes.number,
    pictureAvailable: PropTypes.bool,
    source: PropTypes.string,
    versioncreated: PropTypes.string,
};

export default CardFooter;