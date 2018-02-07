import React from 'react';
import PropTypes from 'prop-types';
import { gettext } from 'utils';

function CardFooter({wordCount, pictureAvailable}) {
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
                <span><span className="bold">{wordCount}</span> {gettext('words')}</span>
            </div>
        </div>
    </div>);
}

CardFooter.propTypes = {
    wordCount: PropTypes.number,
    pictureAvailable: PropTypes.bool,
};

export default CardFooter;