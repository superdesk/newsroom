import React from 'react';
import PropTypes from 'prop-types';
import {getPicture} from 'wire/utils';
import {FieldComponents} from './fields';

const DEFAULT_META_FIELDS = [
    'urgency',
    'source',
    ['charcount', 'wordcount'],
    'previous_versions',
];

function PreviewMeta({
    item,
    isItemDetail,
    inputRef,
    displayConfig,
    listConfig,
}) {
    const picture = getPicture(item);
    const fields = displayConfig.metadata_fields || DEFAULT_META_FIELDS;

    return (
        <div className="wire-articles__item__meta">
            <div className="wire-articles__item__icons">
                {item.type === 'text' && (
                    <span className="wire-articles__item__icon">
                        <i className="icon--text icon--gray-light"></i>
                    </span>
                )}
                {picture && (
                    <span className="wire-articles__item__icon">
                        <i className="icon--photo icon--gray-light"></i>
                    </span>
                )}
            </div>
            <div className="wire-articles__item__meta-info">
                <FieldComponents
                    config={fields}
                    item={item}
                    fieldProps={{
                        listConfig,
                        isItemDetail,
                        inputRef,
                        alwaysShow: true,
                    }}
                />
            </div>
        </div>
    );
}

PreviewMeta.propTypes = {
    item: PropTypes.object,
    isItemDetail: PropTypes.bool,
    inputRef: PropTypes.string,
    displayConfig: PropTypes.object,
    listConfig: PropTypes.object,
};

export default PreviewMeta;
