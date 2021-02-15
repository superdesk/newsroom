import React from 'react';
import PropTypes from 'prop-types';
import {gettext, shortDate, fullDate, isDisplayed} from 'utils';


function CardMeta({wordCount, charCount, pictureAvailable, source, versioncreated, displayDivider, slugline, listConfig}) {
    return (<div className="wire-articles__item__meta">
        <div className="wire-articles__item__icons">
            <span className="wire-articles__item__icon">
                <i className="icon--text icon--gray-light"></i>
            </span>
            {pictureAvailable && <span className="wire-articles__item__icon">
                <i className="icon--photo icon--gray-light"></i>
            </span>}
            {displayDivider && <span className='wire-articles__item__divider'></span>}
        </div>
        <div className="wire-articles__item__meta-info">
            {slugline && <span className='bold'>{slugline}</span>}
            <span>
                {source && source}
                {isDisplayed('wordcount', listConfig) &&
                <span>{'  //  '}<span>{wordCount}</span> {gettext('words')}</span>}
                {isDisplayed('charcount', listConfig) &&
                <span>{'  //  '}<span>{charCount}</span> {gettext('characters')}</span>}
                {versioncreated && ' // '}
                {versioncreated &&
                    <time dateTime={fullDate(versioncreated)}>{shortDate(versioncreated)}</time>
                }
            </span>
        </div>
    </div>);
}

CardMeta.propTypes = {
    wordCount: PropTypes.number,
    charCount: PropTypes.number,
    pictureAvailable: PropTypes.bool,
    source: PropTypes.string,
    versioncreated: PropTypes.string,
    displayDivider: PropTypes.bool,
    slugline: PropTypes.string,
    listConfig: PropTypes.object,
};

CardMeta.defaultProps = {
    displayDivider: false,
};

export default CardMeta;
