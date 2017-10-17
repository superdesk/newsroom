import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { gettext, shortDate, fullDate, wordCount } from 'utils';
import ActionList from 'components/ActionList';

import ListItemPreviousVersions from './ListItemPreviousVersions';

class WireListItem extends React.Component {
    constructor(props) {
        super(props);
        this.wordCount = wordCount(props.item.body_html);
        this.slugline = props.item.slugline && props.item.slugline.trim() ||
          props.item.headline && props.item.headline.replace(/ /g, '-');
        this.state = {isHover: false, previousVersions: false};
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

    render() {
        const {item, onClick} = this.props;
        const cardClassName = classNames('wire-articles__item-wrap col-12', {
            'wire-articles__item--list__selected': this.props.isSelected,
            'border-warning': this.props.isActive,
            'border-primary': this.props.isSelected && !this.props.isActive,
        });
        return (
            <article key={item._id}
                className={cardClassName}
                tabIndex='0'
                onClick={() => !this.props.isActive && onClick(item._id)}
                onMouseEnter={() => this.setState({isHover: true})}
                onMouseLeave={() => this.setState({isHover: false})}
                onKeyDown={this.onKeyDown}
            >

                <div className='wire-articles__item wire-articles__item--list'>
                    <div className='wire-articles__item--list__text'>

                        <h4 className='wire-articles__item--list__headline'>
                            <div className='no-bindable-select wire-articles__item--list__select'>
                                <label className="circle-checkbox">
                                    <input type="checkbox" className="css-checkbox" checked={this.props.isSelected} onChange={this.props.toggleSelected} />
                                    <i></i>
                                </label>
                            </div>
                            {item.headline}
                        </h4>
    
                        <div className='wire-articles__item__meta'>
                            <div className='wire-articles__item__icons'>
                                <span className='wire-articles__item__icon'>
                                    <i className='icon--text icon--gray-light'></i>
                                </span>
                                {/*<span className='wire-articles__item__icon'>*/}
                                {/*<i className='icon--photo icon--gray-light'></i>*/}
                                {/*</span>*/}
                                <span className='wire-articles__item__divider'>
                                </span>
                            </div>
    
                            <div className='wire-articles__item__meta-info'>
                                <span className='bold'>{this.slugline}</span>
                                <span>{gettext('Source: {{ source }}', {source: item.source})}
                                    {' // '}<span className='bold'>{this.wordCount}</span> {gettext('words')}
                                    {' // '}<time dateTime={fullDate(item.versioncreated)}>{shortDate(item.versioncreated)}</time>
                                </span>
                            </div>
                        </div>
    
                        <div className='wire-articles__item__text'>
                            <p>{item.description_text}</p>
                        </div>

                        {item.ancestors && item.ancestors.length && (
                            <div className="no-bindable wire-articles__item__versions-btn" onClick={this.togglePreviousVersions}>
                                {gettext('Show previous versions({{ count }})', {count: item.ancestors.length})}
                            </div>
                        )}
                    </div>
                    
                    <div className='wire-articles__item--list__actions'>
                        <div className='btn-group'>
                            <span onClick={(event) => this.props.onActionList(event, this.props.item)}>
                                <i className='icon--more icon--gray-light'></i>
                            </span>
                            { this.props.showActions ? <ActionList
                                item={this.props.item}
                                actions={this.props.actions}
                            /> : null }
                        </div>
                    </div>
                </div>

                {this.state.previousVersions && <ListItemPreviousVersions item={this.props.item} isPreview={false} />}
            </article>
        );
    }
}

WireListItem.propTypes = {
    item: PropTypes.object.isRequired,
    isActive: PropTypes.bool.isRequired,
    isSelected: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    onActionList: PropTypes.func.isRequired,
    showActions: PropTypes.bool.isRequired,
    toggleSelected: PropTypes.func.isRequired,
    actions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        action: PropTypes.func,
    })),
};

export default WireListItem;
