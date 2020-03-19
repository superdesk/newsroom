import React from 'react';
import PropTypes from 'prop-types';
import types from 'wire/types';
import {isDisplayed} from 'utils';

import FollowStory from './FollowStory';
import PreviewActionButtons from 'components/PreviewActionButtons';

export default function WireActionButtons(props) {
    const {previewConfig} = props;
    const displayFollowStory = previewConfig == null || isDisplayed('follow_story', previewConfig);
    
    return (
        <React.Fragment>
            {previewConfig == null && (
                <div style={{flexGrow: 1}} />
            )}
            <div>
                {displayFollowStory && (
                    <FollowStory
                        user={props.user}
                        item={props.item}
                        topics={props.topics}
                        followStory={props.followStory}
                    />
                )}
            </div>
            <PreviewActionButtons item={props.item} user={props.user} actions={props.actions} />
        </React.Fragment>
    );
}

WireActionButtons.propTypes = {
    item: types.item.isRequired,
    user: types.user.isRequired,
    topics: types.topics.isRequired,
    actions: types.actions.isRequired,
    previewConfig: types.previewConfig,
    followStory: PropTypes.func.isRequired,
};
