import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { gettext, shortDate, fullDate } from 'utils';

function wordCount(html) {
    return html && html.split(' ').filter(x => x.trim()).length || 0;
}

class WireListItem extends React.Component {
    constructor(props) {
        super(props);
        this.wordCount = wordCount(props.item.body_html);
        this.slugline = props.item.slugline && props.item.slugline.trim() ||
          props.item.headline && props.item.headline.replace(/ /g, '-');
    }

    render() {
        const {item, onClick} = this.props;
        return (
            <article key={item._id}
                className={classNames('card', 'list', 'mb-3', {'border border-info': this.props.isActive})}
                tabIndex="0"
                onClick={(event) => event.target.focus()}
                onFocus={() => !this.props.isActive && onClick(item._id)}
                ref={(elem) => this.props.isActive && elem && elem.focus()}>
                <div className="card-body">
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
    onClick: PropTypes.func.isRequired,
};

export default WireListItem;
