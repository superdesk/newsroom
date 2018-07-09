import React from 'react';
import PropTypes from 'prop-types';

import { gettext, formatHTML, formatDate, formatTime } from 'utils';
import { isEqualItem, DISPLAY_ABSTRACT } from 'wire/utils';
import PreviewActionButtons from 'wire/components/PreviewActionButtons';
import {hasCoverages, isRecurring} from '../utils';
import AgendaListItemLabels from './AgendaListItemLabels';
import AgendaPreviewMeta from './AgendaPreviewMeta';
import AgendaPreviewCoverages from './AgendaPreviewCoverages';


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
        const {item, user, actions, followEvent, isFollowing} = this.props;
        return (
            <div className='wire-column__preview__items'>

                <div className="wire-column__preview__mobile-bar">
                    <button className="icon-button" onClick={this.props.closePreview}>
                        <i className="icon--close-large"></i>
                    </button>
                </div>

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

                    <h2 className='wire-column__preview__headline'>{item.name}</h2>

                    <div className="wire-column__preview__content-header">
                        <div className="wire-articles__item__meta-time">
                            <span className="time-label">{formatTime(item.dates.start)}</span>
                            {isRecurring(item) && <span className="time-icon"><i className="icon-small--repeat"></i></span>}
                        </div>
                        <div className="wire-column__preview__date">{formatDate(item.dates.start)}</div>
                        <AgendaListItemLabels item={item} />
                    </div>



                    <AgendaPreviewMeta item={item} />

                    {item.abstract && DISPLAY_ABSTRACT &&
                        <p className='wire-column__preview__lead'>{item.abstract}</p>
                    }

                    {item.definition_long &&
                        <div className='wire-column__preview__text' id='preview-body' dangerouslySetInnerHTML={({__html: formatHTML(item.definition_long)})} />
                    }

                    {hasCoverages(item) && <AgendaPreviewCoverages coverages={item.coverages} />}

                    {item.ednote && <div className="wire-column__preview__editorial-note">
                        <i className="icon-small--info icon--gray"></i>
                        <span>{item.ednote}</span>
                    </div>}

                </div>
            </div>
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
};

export default AgendaPreview;
