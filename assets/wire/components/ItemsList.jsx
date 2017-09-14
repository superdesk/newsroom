import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { shortDate } from '../utils';

class ItemsList extends React.Component {
    constructor(props) {
        super(props);
    }

    focus(event) {
        event.target.focus();
    }

    render() {
        const {items, onClick} = this.props;

        const articles = items.map((item) => {
            const className = classNames('card', 'list', 'mb-3');

            return (
                <article key={item._id}
                    className={className}
                    tabIndex="0"
                    onClick={this.focus}
                    onFocus={() => onClick(item._id)}>
                    <div className="card-body">
                        <h4 className="card-title">{item.headline}</h4>
                        <h6 className="card-subtitle">{item.slugline}</h6>
                        <small className="card-subtitle">Source: {item.source} {'//'} {shortDate(item.versioncreated)}</small>
                        <p className="card-text">{item.description_text}</p>
                    </div>
                </article>
            );
        });

        return <div className="col">{articles}</div>;
    }
}

ItemsList.propTypes = {
    items: PropTypes.array.isRequired,
    onClick: PropTypes.func.isRequired,
    activeItem: PropTypes.string,
};

export default ItemsList;
