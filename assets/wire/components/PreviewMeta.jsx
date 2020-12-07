import React from 'react';
import PropTypes from 'prop-types';
import { gettext, wordCount, isDisplayed, characterCount } from 'utils';
import { getPicture } from 'wire/utils';
import { UrgencyLabel } from './UrgencyLabel';

function PreviewMeta({
    item,
    isItemDetail,
    inputRef,
    displayConfig,
    listConfig,
}) {
    const picture = getPicture(item);
    const onClick = () => {
        const previousVersions = document.getElementById(inputRef);
        previousVersions && previousVersions.scrollIntoView();
    };
    const wordsSeparator =
        isDisplayed('charcount', displayConfig) &&
        isDisplayed('wordcount', displayConfig);

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
                {isDisplayed('urgency', displayConfig) && (
                    <UrgencyLabel
                        item={item}
                        listConfig={listConfig}
                        alwaysShow
                    />
                )}
                <div>
                    {isDisplayed('source', displayConfig) &&
                        gettext('{{ source }}', {
                            source: item.source,
                        })}
                    {isDisplayed('sttdepartment', displayConfig) &&
                        item.sttdepartment && (
                        <span>
                            {isItemDetail ? <br /> : ' // '}
                            <strong>{item.sttdepartment}</strong>
                        </span>
                    )}
                </div>
                <div>
                    {item.sttversion &&
                        isDisplayed('sttversion', listConfig) &&
                        (isItemDetail
                            ? item.sttversion
                            : gettext('Version type: {{ version }}', {
                                version: item.sttversion,
                            }))}
                </div>
                <div>
                    {isDisplayed('charcount', displayConfig) && (
                        <span>
                            <span>{characterCount(item)} </span>
                            {gettext('characters')}
                        </span>
                    )}
                    {wordsSeparator &&
                        (isItemDetail ? <br /> : <span> / </span>)}
                    {isDisplayed('wordcount', displayConfig) && (
                        <span>
                            <span>{wordCount(item)} </span>
                            {gettext('words')}
                        </span>
                    )}
                </div>
                <span>
                    {!isItemDetail && (
                        <div className="blue-text" onClick={onClick}>
                            {gettext('{{ count }} previous versions', {
                                count: item.ancestors
                                    ? item.ancestors.length
                                    : '0',
                            })}
                        </div>
                    )}
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
    listConfig: PropTypes.object,
};

export default PreviewMeta;
