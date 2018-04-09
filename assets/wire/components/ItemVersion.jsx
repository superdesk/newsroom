import React from 'react';
import PropTypes from 'prop-types';

import { gettext, formatTime, formatDate, wordCount } from 'utils';

export default function ItemVersion({version, baseClass, showDivider, onClick}) {
    return (
        <div className={`${baseClass}__versions__item`} onClick={(event) => onClick(version, event)}>
            <div className={`${baseClass}__versions__wrap`}>
                <div className={`${baseClass}__versions__time`}>
                    <span>{formatTime(version.versioncreated)}</span>
                </div>
                <div className={`${baseClass}__versions__meta`}>
                    <div className={`${baseClass}__item__meta-info`}>
                        <span className="bold">{version.slugline}</span>
                        <span>{formatDate(version.versioncreated)} {' // '}
                            <span>{wordCount(version)}</span> {gettext('words')}
                        </span>
                    </div>
                </div>
            </div>
            {showDivider && <span className={`${baseClass}__item__divider`}></span> }
            <div className={`${baseClass}__versions__name`}>
                <h5 className={`${baseClass}__versions__headline`}>{version.headline}</h5>
            </div>
        </div>
    );
}

ItemVersion.propTypes = {
    version: PropTypes.object.isRequired,
    baseClass: PropTypes.string.isRequired,
    showDivider: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
};
