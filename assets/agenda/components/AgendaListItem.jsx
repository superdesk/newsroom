import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {get} from 'lodash';

import ActionButton from 'components/ActionButton';

import AgendaListItemIcons from './AgendaListItemIcons';
import {
    hasCoverages,
    isCanceled,
    isPostponed,
    isRescheduled,
    getName,
    isWatched,
    getDescription,
} from '../utils';
import ActionMenu from '../../components/ActionMenu';
import { LIST_ANIMATIONS } from 'utils';

class AgendaListItem extends React.Component {
    constructor(props) {
        super(props);
        this.slugline = props.item.slugline && props.item.slugline.trim();
        this.state = {isHover: false, previousVersions: false};
        this.onKeyDown = this.onKeyDown.bind(this);
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

    shouldComponentUpdate(nextProps, nextState) {
        const {props, state} = this;

        return props.item._etag !== nextProps.item._etag || state.hover !== nextState.hover ||
            props.isActive !== nextProps.isActive || props.isSelected !== nextProps.isSelected ||
            props.isExtended !== nextProps.isExtended ||
            get(props.actioningItem, '_id') === props.item._id ||
            get(nextProps.actioningItem, '_id') === props.item._id ||
            props.isRead !== nextProps.isRead ||
            (get(props, 'item.bookmarks') || []).includes(props.user) !==
            (get(nextProps, 'item.bookmarks') || []).includes(nextProps.user) ||
            isWatched(props.item, props.user) !== isWatched(nextProps.item, nextProps.user);
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
        const {item, onClick, onDoubleClick, isExtended, group, planningId} = this.props;
        const cardClassName = classNames('wire-articles__item-wrap col-12');
        const wrapClassName = classNames('wire-articles__item wire-articles__item--list', {
            'wire-articles__item--covering': hasCoverages(this.props.item),
            'wire-articles__item--watched': isWatched(this.props.item, this.props.user),
            'wire-articles__item--not-covering': !hasCoverages(this.props.item),
            'wire-articles__item--postponed': isPostponed(this.props.item),
            'wire-articles__item--canceled': isCanceled(this.props.item),
            'wire-articles__item--visited': isCanceled(this.props.item),
            'wire-articles__item--rescheduled': isRescheduled(this.props.item),
            'wire-articles__item--selected': this.props.isSelected,
            'wire-articles__item--open': this.props.isActive,
        });
        const selectClassName = classNames('no-bindable-select', {
            'wire-articles__item-select-visible': !LIST_ANIMATIONS,
            'wire-articles__item-select': LIST_ANIMATIONS,
        });
        const articleClassName = classNames('wire-articles__item-text', {
            'flex-column align-items-start': !isExtended
        });
        const planningItem = (get(item, 'planning_items') || []).find((p) => p.guid === planningId) || {};
        const description = getDescription(item, planningItem);

        // Show headline for adhoc planning items
        const showHeadline = !item.event && get(item, 'headline.length', 0) > 0;

        return (
            <article key={item._id}
                className={cardClassName}
                tabIndex='0'
                ref={(elem) => this.articleElem = elem}
                onClick={() => onClick(item, group, planningId)}
                onDoubleClick={() => onDoubleClick(item, group, planningId)}
                onMouseEnter={() => {
                    this.setState({isHover: true});
                    if (this.props.actioningItem && this.props.actioningItem._id !== item._id) {
                        this.props.resetActioningItem();
                    }
                }}
                onMouseLeave={() => this.setState({isHover: false})}
                onKeyDown={this.onKeyDown}
            >

                <div className={wrapClassName}>
                    <div className={articleClassName}>

                        <h4 className='wire-articles__item-headline'>
                            <div className={selectClassName} onClick={this.stopPropagation}>
                                <label className="circle-checkbox">
                                    <input type="checkbox" className="css-checkbox" checked={this.props.isSelected} onChange={this.props.toggleSelected} />
                                    <i></i>
                                </label>
                            </div>

                            <span className={
                                classNames({'wire-articles__item__meta-time wire-articles__item__meta-time--border-right': showHeadline})}>
                                {getName(item)}</span>
                            {showHeadline && <span
                                className='wire-articles__item__text wire-articles__item__text--large'>
                                {item.headline}</span>}
                        </h4>

                        <AgendaListItemIcons item={item} group={group} planningItem={planningItem} />

                        {isExtended && description && (
                            <p className="wire-articles__item__text">
                                {description}
                            </p>
                        )}

                    </div>

                    {this.props.actions.length && (
                        <div className='wire-articles__item-actions' onClick={this.stopPropagation}>
                            <ActionMenu
                                item={this.props.item}
                                plan={planningItem}
                                user={this.props.user}
                                group={this.props.group}
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
                    )}
                </div>

            </article>
        );
    }
}

AgendaListItem.propTypes = {
    item: PropTypes.object.isRequired,
    group: PropTypes.string,
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
    actioningItem: PropTypes.object,
    resetActioningItem: PropTypes.func,
    planningId: PropTypes.string,
};

export default AgendaListItem;
