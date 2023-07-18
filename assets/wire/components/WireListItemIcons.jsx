import React from 'react';
import PropTypes from 'prop-types';
import {isEmpty} from 'lodash';

function WireListItemIcons({item, picture, videos, audio, divider}) {
    return (
        <div className='wire-articles__item__icons'>
            {item.type === 'text' &&
                <span className='wire-articles__item__icon'>
                    <i className='icon--text icon--gray-light'></i>
                </span>
            }
            {picture &&
                <span className='wire-articles__item__icon'>
                    <i className='icon--photo icon--gray-light'></i>
                </span>
            }
            {!isEmpty(videos) &&
                <span className='wire-articles__item__icon'>
                    <i className='icon--video icon--gray-light'></i>
                </span>
            }
            {!isEmpty(audio) &&
                <span className='wire-articles__item__icon'>
                    <i className='icon--audio icon--gray-light'></i>
                </span>
            }
            {divider &&
                <span className='wire-articles__item__divider' />
            }
        </div>
    );
}

WireListItemIcons.propTypes = {
    item: PropTypes.object,
    picture: PropTypes.object,
    videos: PropTypes.array,
    audio: PropTypes.array,
    divider: PropTypes.bool,
};

export default WireListItemIcons;
