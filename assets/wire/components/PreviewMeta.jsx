import React from 'react';
import PropTypes from 'prop-types';
import { gettext, wordCount } from 'utils';
import { getPicture } from 'wire/utils';

const DEFAULT_URGENCY = 4;


function PreviewMeta({item, isItemDetail}) {
    const picture = getPicture(item);
    return (
        <div className='wire-articles__item__meta'>
            <div className='wire-articles__item__icons'>
                <span className='wire-articles__item__icon'>
                    <i className='icon--text icon--gray-light'></i>
                </span>
                {picture && (
                    <span className='wire-articles__item__icon'>
                        <i className='icon--photo icon--gray-light'></i>
                    </span>
                )}
                {!isItemDetail && <span className='wire-articles__item__divider'>
                </span>}
            </div>
            <div className='wire-articles__item__meta-info'>
                <span>{gettext('News Value: {{ value }}', {value: item.urgency || DEFAULT_URGENCY})}</span>
                <span><span className='bold'>{wordCount(item.body_html)}</span> {gettext('words')}</span>
                <span>{gettext('Source: {{ source }}', {source: item.source})}
                    {!isItemDetail && ' // '}
                    {!isItemDetail && <span className="blue-text">
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
};

export default PreviewMeta;
