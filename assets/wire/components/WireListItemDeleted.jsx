import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import {gettext, LIST_ANIMATIONS} from 'utils';

export default function WireListItemDeleted({item, contextName}) {
    const selectClassName = classNames('no-bindable-select', {
        'wire-articles__item-select-visible': !LIST_ANIMATIONS,
        'wire-articles__item-select': LIST_ANIMATIONS,
    });

    return (
        <article key={item._id}
            className="wire-articles__item-wrap col-12 wire-item item--deleted"
            tabIndex='0'
        >
            <div className="wire-articles__item wire-articles__item--list wire-articles__item--visited">
                <div className='wire-articles__item-text'>
                    <h4 className='wire-articles__item-headline'>
                        <div className={selectClassName}>
                            <label>
                                <i className="icon--info icon--gray" />
                            </label>
                        </div>
                        {item.headline}
                    </h4>

                    <div className='wire-articles__item__text'>
                        <p>{gettext(
                            'This item has been removed from {{ context_name }}',
                            {context_name: contextName}
                        )}</p>
                    </div>
                </div>
            </div>
        </article>
    );
}

WireListItemDeleted.propTypes = {
    item: PropTypes.object,
    contextName: PropTypes.string,
};
