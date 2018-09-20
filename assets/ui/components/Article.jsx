import React from 'react';
import PropTypes from 'prop-types';
import {bem} from '../utils';

export default function Article(props) {
    return (
        <article id='preview-article' className="wire-column__preview__content--item-detail-wrap">
            <div className={bem('wire-column__preview', 'content', {covering: props.covering})}>
                {props.image &&
                    <figure className="wire-column__preview__image">
                        {props.image}
                    </figure>
                }

                <div className="wire-column__preview__content--item-detail-text-wrap">
                    {props.children}
                </div>
            </div>
        </article>
    );
}

Article.propTypes = {
    covering: PropTypes.bool,
    image: PropTypes.element,
    children: PropTypes.node,
};