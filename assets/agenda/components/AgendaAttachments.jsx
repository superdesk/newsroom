import React from 'react';
import {hasAttachments, getAttachments} from '../utils';

import {gettext} from 'utils';
import {bem} from 'ui/utils';

const kB = 1024;
const MB = kB * kB;

function filesize (size) {
    if (size > MB) {
        return (size / MB).toFixed(1) + ' MB';
    } else if (size > kB) {
        return (size / kB).toFixed(1) + ' kB';
    } else {
        return size + ' B';
    }
}

export default function AgendaAttachments({item}) {
    if (!hasAttachments(item)) {
        return null;
    }

    return getAttachments(item).map((attachment) => (
        <div key={attachment.media} className="coverage-item flex-row">
            <div className={bem('coverage-item', 'column', 'grow')}>
                <div className="coverage-item__row">
                    <span className="d-flex coverage-item--element-grow text-overflow-ellipsis">
                        <i className="icon-small--attachment icon--green mr-2"></i>
                        <span className="text-overflow-ellipsis">{attachment.name}</span>
                    </span>
                </div>
                <div className="coverage-item__row">
                    <span className="coverage-item__text-label mr-1">{gettext('Size:')}</span>
                    <span className="mr-2">{filesize(attachment.length)}</span>
                    <span className="coverage-item__text-label mr-1">{gettext('MIME type:')}</span>
                    <span>{attachment.mimetype}</span>
                </div>
            </div>
            <div className="coverage-item__column">
                <a className="icon-button" href={attachment.href + '?filename=' + attachment.name}>
                    <i className="icon--download icon--gray"></i>
                </a>
            </div>
        </div>
    ));
}