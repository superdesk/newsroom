import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { gettext, shortDate, fullDate, wordCount } from 'utils';

class WireListItem extends React.Component {
    constructor(props) {
        super(props);
        this.wordCount = wordCount(props.item.body_html);
        this.slugline = props.item.slugline && props.item.slugline.trim() ||
          props.item.headline && props.item.headline.replace(/ /g, '-');
        this.state = {isHover: false};
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

    render() {
        const {item, onClick} = this.props;
        const cardClassName = classNames('card', 'list', 'mb-3', {
            'border-warning': this.props.isActive,
            'border-primary': this.props.isSelected && !this.props.isActive,
        });
        return (
            <article key={item._id}
                className={cardClassName}
                tabIndex="0"
                onClick={(event) => event.target.focus()}
                onFocus={() => !this.props.isActive && onClick(item._id)}
                ref={(elem) => this.props.isActive && elem && elem.focus()}
                onMouseEnter={() => this.setState({isHover: true})}
                onMouseLeave={() => this.setState({isHover: false})}
                onKeyDown={this.onKeyDown}
            >
                <div className="card-body">
                    {(this.props.isSelected || this.state.isHover) &&
                        <input type="checkbox" checked={this.props.isSelected} onChange={this.props.toggleSelected} />
                    }
                    <h4 className="card-title">{item.headline}</h4>
                    <h6 className="card-subtitle">{this.slugline}</h6>
                    <small className="card-subtitle">
                        {gettext('Source: {{ source }}', {source: item.source})}
                        {' // '}
                        <b>{this.wordCount}</b> {gettext('words')}
                        {' // '}
                        <time dateTime={fullDate(item.versioncreated)}>{shortDate(item.versioncreated)}</time>
                    </small>
                    <p className="card-text">{item.description_text}</p>
                </div>
            </article>
        );
    }
}

WireListItem.propTypes = {
    item: PropTypes.object.isRequired,
    isActive: PropTypes.bool.isRequired,
    isSelected: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    toggleSelected: PropTypes.func.isRequired,
};

export default WireListItem;
