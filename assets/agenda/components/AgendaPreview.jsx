import React from 'react';
import PropTypes from 'prop-types';

import { gettext } from 'utils';
import { isEqualItem } from 'wire/utils';
import PreviewActionButtons from 'components/PreviewActionButtons';

import Preview from 'ui/components/Preview';

import AgendaName from './AgendaName';
import AgendaTime from './AgendaTime';
import AgendaMeta from './AgendaMeta';
import AgendaEdNote from './AgendaEdNote';
import AgendaPreviewCoverages from './AgendaPreviewCoverages';
import AgendaPreviewImage from './AgendaPreviewImage';
import AgendaLongDescription from './AgendaLongDescription';
import AgendaPreviewAttachments from './AgendaPreviewAttachments';

class AgendaPreview extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    componentDidUpdate(nextProps) {
        if (!isEqualItem(nextProps.item, this.props.item)) {
            this.preview.scrollTop = 0; // reset scroll on change
        }
    }

    render() {
        const {item, user, actions, followEvent, isFollowing, openItemDetails} = this.props;
        return (
            <Preview onCloseClick={this.props.closePreview}>
                <div className='wire-column__preview__top-bar'>
                    <div>
                        {user && item.slugline && item.slugline.trim() &&
                            <button type="button"
                                disabled={isFollowing}
                                className="btn btn-outline-primary btn-responsive"
                                onClick={() => followEvent(item)}>
                                {gettext('Follow event')}
                            </button>
                        }
                    </div>

                    <PreviewActionButtons item={item} user={user} actions={actions} />
                </div>

                <div id='preview-article' className='wire-column__preview__content' ref={(preview) => this.preview = preview}>
                    <AgendaName item={item} />
                    <AgendaTime item={item} />
                    <AgendaPreviewImage item={item} onClick={openItemDetails} />
                    <AgendaMeta item={item} />
                    <AgendaLongDescription item={item} />
                    <AgendaPreviewCoverages item={item} />
                    <AgendaPreviewAttachments item={item} />
                    <AgendaEdNote item={item} />
                </div>
            </Preview>
        );
    }
}

AgendaPreview.propTypes = {
    user: PropTypes.string,
    item: PropTypes.object.isRequired,
    actions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        action: PropTypes.func,
        url: PropTypes.func,
    })),
    followEvent: PropTypes.func,
    isFollowing: PropTypes.bool,
    closePreview: PropTypes.func,
    openItemDetails: PropTypes.func,
};

export default AgendaPreview;
