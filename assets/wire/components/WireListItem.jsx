import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {get} from 'lodash';

import {gettext, fullDate, wordCount, LIST_ANIMATIONS, getSlugline} from 'utils';
import {getPicture, getThumbnailRendition, showItemVersions, shortText, isKilled, getVideos} from 'wire/utils';

import ActionButton from 'components/ActionButton';

import ListItemPreviousVersions from './ListItemPreviousVersions';
import WireListItemIcons from './WireListItemIcons';
import WireListItemEmbargoed from './WireListItemEmbargoed';
import ActionMenu from '../../components/ActionMenu';
import WireListItemDeleted from './WireListItemDeleted';

class WireListItem extends React.Component {
    constructor(props) {
        super(props);
        this.wordCount = wordCount(props.item);
        this.state = {previousVersions: false};
        this.onKeyDown = this.onKeyDown.bind(this);
        this.togglePreviousVersions = this.togglePreviousVersions.bind(this);

        this.dom = {article: null};
    }

    onKeyDown(event) {
        switch (event.key) {
        case ' ':  // on space toggle selected item
            this.props.toggleSelected();
            break;

        default:
            return;
        }

        event.preventDefault();
    }

    togglePreviousVersions(event) {
        event.stopPropagation();
        this.setState({previousVersions: !this.state.previousVersions});
    }

    componentDidMount() {
        if (this.props.isActive && this.dom.article) {
            this.dom.article.focus();
        }
    }

    stopPropagation(event) {
        event.stopPropagation();
    }

    render() {
        const {item, onClick, onDoubleClick, isExtended} = this.props;

        if (get(this.props, 'item.deleted')) {
            return (
                <WireListItemDeleted
                    item={this.props.item}
                    contextName={this.props.contextName}
                />
            );
        }

        const cardClassName = classNames('wire-articles__item-wrap col-12 wire-item');
        const wrapClassName = classNames('wire-articles__item wire-articles__item--list', {
            'wire-articles__item--visited': this.props.isRead,
            'wire-articles__item--open': this.props.isActive,
            'wire-articles__item--selected': this.props.isSelected,
        });
        const selectClassName = classNames('no-bindable-select', {
            'wire-articles__item-select-visible': !LIST_ANIMATIONS,
            'wire-articles__item-select': LIST_ANIMATIONS,
        });
        const picture = getPicture(item);
        const videos = getVideos(item);
        const isMarketPlace = this.props.context === 'aapX';

        return (
            <article key={item._id}
                className={cardClassName}
                tabIndex='0'
                ref={(elem) => this.dom.article = elem}
                onClick={() => onClick(item)}
                onDoubleClick={() => onDoubleClick(item)}
                onKeyDown={this.onKeyDown}
            >
                <div className={wrapClassName}>
                    <div className='wire-articles__item-text'>
                        <h4 className='wire-articles__item-headline'>
                            <div className={selectClassName} onClick={this.stopPropagation}>
                                <label className="circle-checkbox">
                                    <input type="checkbox" className="css-checkbox" checked={this.props.isSelected} onChange={this.props.toggleSelected} />
                                    <i></i>
                                </label>
                            </div>
                            {!isExtended && (
                                <WireListItemIcons item={item} picture={picture} videos={videos} divider={false} />
                            )}
                            {item.headline}
                        </h4>

                        {isExtended && !isMarketPlace && (
                            <div className='wire-articles__item__meta'>
                                <WireListItemIcons item={item} picture={picture} videos={videos} />
                                <div className='wire-articles__item__meta-info'>
                                    <span className='bold'>{getSlugline(item, true)}</span>
                                    <span>{item.source}
                                        {' // '}<span>{this.wordCount}</span> {gettext('words')}
                                        {' // '}<time dateTime={fullDate(item.versioncreated)}>{fullDate(item.versioncreated)}</time>
                                        <WireListItemEmbargoed item={item} />
                                    </span>
                                </div>
                            </div>
                        )}

                        {isExtended && isMarketPlace && (
                            [<div key='mage' className='wire-articles__item__meta'>
                                <img src={`/theme/logo/${item.source}.png`}/>
                            </div>,
                            <div key='meta' className='wire-articles__item__meta'>
                                <WireListItemIcons item={item} picture={picture} videos={videos} />
                                <div className='wire-articles__item__meta-info'>
                                    <span>{this.wordCount} {gettext('words')}</span>
                                </div>
                            </div>]
                        )}
                        {!isExtended && (
                            <div className='wire-articles__item__meta'>
                                <div className='wire-articles__item__meta-info'>
                                    <time dateTime={fullDate(item.versioncreated)}>{fullDate(item.versioncreated)}</time>
                                </div>
                            </div>
                        )}

                        {isExtended && (
                            <div className='wire-articles__item__text'>
                                <p>{shortText(item)}</p>
                            </div>
                        )}

                        {showItemVersions(item) && (
                            <div className="no-bindable wire-articles__item__versions-btn" onClick={this.togglePreviousVersions}>
                                {gettext('Show previous versions ({{ count }})', {count: item.ancestors.length})}
                            </div>
                        )}
                    </div>

                    {isExtended && !isKilled(item) && getThumbnailRendition(picture) && (
                        <div className="wire-articles__item-image">
                            <figure>
                                <img src={getThumbnailRendition(picture).href} />
                            </figure>
                        </div>
                    )}

                    <div className='wire-articles__item-actions' onClick={this.stopPropagation}>
                        <ActionMenu
                            item={this.props.item}
                            user={this.props.user}
                            actions={this.props.actions}
                            onActionList={this.props.onActionList}
                            showActions={this.props.showActions}
                        />

                        {this.props.actions.map((action) =>
                            action.shortcut &&
                          <ActionButton
                              key={action.name}
                              className="icon-button"
                              action={action}
                              isVisited={action.visited && action.visited(this.props.user, this.props.item)}
                              item={this.props.item} />
                        )}
                    </div>
                </div>

                {this.state.previousVersions &&
                    <ListItemPreviousVersions item={this.props.item} isPreview={false} />
                }
            </article>
        );
    }
}

WireListItem.propTypes = {
    item: PropTypes.object.isRequired,
    isActive: PropTypes.bool.isRequired,
    isSelected: PropTypes.bool.isRequired,
    isRead: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    onDoubleClick: PropTypes.func.isRequired,
    onActionList: PropTypes.func.isRequired,
    showActions: PropTypes.bool.isRequired,
    toggleSelected: PropTypes.func.isRequired,
    actions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        action: PropTypes.func,
    })),
    isExtended: PropTypes.bool.isRequired,
    user: PropTypes.string,
    context: PropTypes.string,
    contextName: PropTypes.string,
};

export default WireListItem;
