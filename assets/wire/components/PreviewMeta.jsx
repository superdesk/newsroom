import React from 'react';
import PropTypes from 'prop-types';
import {gettext, wordCount, isDisplayed, characterCount} from 'utils';
import { getPicture } from 'wire/utils';

const DEFAULT_URGENCY = 4;



function PreviewMeta({item, isItemDetail, inputRef, displayConfig}) {
    const picture = getPicture(item);
    const onClick = () => {
        const previousVersions = document.getElementById(inputRef);
        previousVersions && previousVersions.scrollIntoView();
    };

    return (
        <div className='wire-articles__item__meta'>
            <div className='wire-articles__item__icons'>
                {item.type === 'text' &&
                    <span className='wire-articles__item__icon'>
                        <i className='icon--text icon--gray-light'></i>
                    </span>
                }
                {picture && (
                    <span className='wire-articles__item__icon'>
                        <i className='icon--photo icon--gray-light'></i>
                    </span>
                )}
            </div>
            <div className='wire-articles__item__meta-info'>
                {isDisplayed('urgency', displayConfig) &&
                <span>{gettext('News Value: {{ value }}', {value: item.urgency || DEFAULT_URGENCY})}</span>}
                {isDisplayed('wordcount', displayConfig) && <span>{gettext('Words:')}<span> {wordCount(item)}</span></span>}
                {isDisplayed('charcount', displayConfig) && <span>{gettext('Characters:')}<span> {characterCount(item)}</span></span>}
                <span>{isDisplayed('source', displayConfig) && gettext('Source: {{ source }}', {source: item.source})}
                    {!isItemDetail && ' // '}
                    {!isItemDetail && <span className="blue-text" onClick={onClick}>
                        {gettext('{{ count }} previous versions', {count: item.ancestors ? item.ancestors.length : '0'})}
                    </span>}
                </span>
            </div>
        </div>
    );
}

PreviewMeta.propTypes = {
    item: PropTypes.object,
    isItemDetail: PropTypes.bool,
    inputRef: PropTypes.string,
    displayConfig: PropTypes.object,
};

export default PreviewMeta;
