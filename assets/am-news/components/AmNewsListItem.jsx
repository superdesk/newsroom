import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {get} from 'lodash';

import {LIST_ANIMATIONS, wordCount} from 'utils';
import {getPicture, getThumbnailRendition, isKilled, shortText} from '../../wire/utils';

import ActionMenu from 'components/ActionMenu';
import ActionButton from 'components/ActionButton';
import MetaTime from 'ui/components/MetaTime';
import AMNewsIcon from './AmNewsIcon';

import ListItemPreviousVersions from '../../wire/components/ListItemPreviousVersions';
import WireListItemDeleted from '../../wire/components/WireListItemDeleted';

import {
    getAMNewsIcon,
    isAlert,
    isDataItem,
    getAMNewsToolTip,
} from '../utils';


class AmNewsListItem extends React.Component {
    constructor(props) {
        super(props);
        this.wordCount = wordCount(props.item);
        this.state = {previousVersions: false};
        this.onKeyDown = this.onKeyDown.bind(this);
        this.togglePreviousVersions = this.togglePreviousVersions.bind(this);
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
        if (this.props.isActive) {
            this.articleElem.focus();
        }
    }

    stopPropagation(event) {
        event.stopPropagation();
    }

    render() {
        const {item, onClick, onDoubleClick} = this.props;

        if (get(this.props, 'item.deleted')) {
            return (
                <WireListItemDeleted
                    item={this.props.item}
                    contextName={this.props.contextName}
                />
            );
        }

        const cardClassName = classNames('wire-articles__item-wrap col-12');
        const wrapClassName = classNames('wire-articles__item wire-articles__item--list', {
            'wire-articles__item--visited': this.props.isRead,
            'wire-articles__item--open': this.props.isActive,
            'wire-articles__item--selected': this.props.isSelected,
            'wire-articles__item--alert': isAlert(item),
            'wire-articles__item--not-alert': !isAlert(item),
        });
        const selectClassName = classNames('no-bindable-select', {
            'wire-articles__item-select-visible': !LIST_ANIMATIONS,
            'wire-articles__item-select': LIST_ANIMATIONS,
        });
        const metaTimeClassName = classNames('', {
            'time-label--data': isDataItem(item),
            'time-label--stories': !isDataItem(item),
        });
        const picture = getPicture(item);


        return (
            <article key={item._id}
                className={cardClassName}
                tabIndex='0'
                ref={(elem) => this.articleElem = elem}
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
                            <MetaTime
                                date={item.versioncreated} borderRight={true}
                                cssClass={metaTimeClassName}/>
                            <AMNewsIcon
                                iconType={getAMNewsIcon(item)}
                                toolTip={getAMNewsToolTip(item)}
                                borderRight={true}/>{item.headline}
                        </h4>

                        <div className="wire-articles__item__text">
                            {shortText(item, 50, true)}
                        </div>
                    </div>

                    {!isKilled(item) && getThumbnailRendition(picture) && (
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

AmNewsListItem.propTypes = {
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
    user: PropTypes.string,
    contextName: PropTypes.string,
};

export default AmNewsListItem;
