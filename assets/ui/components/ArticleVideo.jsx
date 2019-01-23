import React from 'react';
import PropTypes from 'prop-types';
import {gettext} from 'utils';

export default function ArticleVideo({isKilled, video, headline, downloadVideo}) {
    return (
        (video && !isKilled) && (
            <div className='wire-column__preview__video'>
                <span className='wire-column__preview__video-headline'>{headline}</span>
                <video controls>
                    <source src={video.href} type={video.mimetype} />
                    {gettext('Your browser does not support HTML5 video')}
                </video>
                <button className="btn btn-responsive mb-2"
                    onClick={() => downloadVideo(video.href, video.media, video.mimetype)}>
                    <i className="fa fa-download"></i>{gettext('Download')}
                </button>
            </div>
        ) || null
    );
}

ArticleVideo.propTypes = {
    isKilled: PropTypes.bool.isRequired,
    video: PropTypes.object.isRequired,
    headline: PropTypes.string.isRequired,
    downloadVideo: PropTypes.func,
};