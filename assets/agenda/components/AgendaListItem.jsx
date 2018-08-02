import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import ActionList from 'components/ActionList';
import ActionButton from 'components/ActionButton';

import AgendaListItemIcons from './AgendaListItemIcons';
import {hasCoverages, isCanceled, isPostponed, isRescheduled, getName} from '../utils';

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

    componentDidMount() {
        if (this.props.isActive) {
            this.articleElem.focus();
        }
    }

    stopPropagation(event) {
        event.stopPropagation();
    }

    render() {
        const {item, onClick, onDoubleClick, isExtended} = this.props;
        const cardClassName = classNames('wire-articles__item-wrap col-12');
        const wrapClassName = classNames('wire-articles__item wire-articles__item--list', {
            'wire-articles__item--covering': hasCoverages(this.props.item),
            'wire-articles__item--not-covering': !hasCoverages(this.props.item),
            'wire-articles__item--postponed': isPostponed(this.props.item),
            'wire-articles__item--cancelled': isCanceled(this.props.item),
            'wire-articles__item--rescheduled': isRescheduled(this.props.item),
            'wire-articles__item--selected': this.props.isSelected,
        });
        const articleClassName = classNames('wire-articles__item-text', {
            'flex-column align-items-start': !isExtended
        });

        return (
            <article key={item._id}
                className={cardClassName}
                tabIndex='0'
                ref={(elem) => this.articleElem = elem}
                onClick={() => onClick(item)}
                onDoubleClick={() => onDoubleClick(item)}
                onMouseEnter={() => this.setState({isHover: true})}
                onMouseLeave={() => this.setState({isHover: false})}
                onKeyDown={this.onKeyDown}
            >

                <div className={wrapClassName}>
                    <div className={articleClassName}>

                        <h4 className='wire-articles__item-headline'>
                            <div className='no-bindable-select wire-articles__item-select' onClick={this.stopPropagation}>
                                <label className="circle-checkbox">
                                    <input type="checkbox" className="css-checkbox" checked={this.props.isSelected} onChange={this.props.toggleSelected} />
                                    <i></i>
                                </label>
                            </div>

                            {getName(item)}
                        </h4>

                        <AgendaListItemIcons item={item} />

                        {isExtended && item.definition_short && (
                            <p className="wire-articles__item__text">
                                {item.definition_short}
                            </p>
                        )}

                    </div>

                    {this.props.actions.length && (
                        <div className='wire-articles__item-actions' onClick={this.stopPropagation}>
                            <div className='btn-group'>
                                <span onClick={(event) => this.props.onActionList(event, this.props.item)}>
                                    <i className='icon--more icon--gray-light'></i>
                                </span>
                                { this.props.showActions ? <ActionList
                                    item={this.props.item}
                                    user={this.props.user}
                                    actions={this.props.actions}
                                /> : null }
                            </div>

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
};

export default AgendaListItem;
