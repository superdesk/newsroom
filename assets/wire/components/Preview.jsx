import React from 'react';
import PropTypes from 'prop-types';

import { gettext, fullDate, wordCount } from 'utils';
import ListItemPreviousVersions from './ListItemPreviousVersions';

const DEFAULT_URGENCY = 4;

function formatCV(items) {
    return items && items.map((item) => (
        <a key={item.code} className='wire-column__preview__tag' href="#">{item.name}</a>
    ));
}

function Preview({item, actions}) {
    const actionButtons = actions.map((action) => {
        const payload = action.multi ? [item._id] : item;
        return (
            <span className='wire-column__preview__icon'
                key={action.name}
                onClick={() => action.action(payload)}>
                <i className={`icon--${action.icon}`}></i>
            </span>
        );
    });

    const genres = item.genre && formatCV(item.genre);
    const subjects = item.subject && formatCV(item.subject);

    return (
        <div className='wire-column__preview__items'>

            <div className='wire-column__preview__top-bar'>
                <span className='wire-column__preview__date'>{gettext('Created {{ date }}' , {date: fullDate(item.versioncreated)})}</span>
                <div className='wire-column__preview__buttons'>
                    {actionButtons}
                </div>
            </div>

            <div id='preview-article' className='wire-column__preview__content'>
                <span className='wire-column__preview__slug'>{item.slugline}</span>
                <h2 className='wire-column__preview__headline'>{item.headline}</h2>
                <p className='wire-column__preview__author'>{gettext('By')}{' '}
                    <span className='bold'>{item.byline}</span>{' '}
                    <span>{gettext('in {{ located}}', {located: item.located})}</span>
                </p>
                {/*<figure className='wire-column__preview__image'>*/}
                {/*<span className='wire-column__preview__image-icon'>*/}
                {/*<i className='icon--resize icon--white'></i>*/}
                {/*</span>*/}
                {/*<img src='/static/article_preview.png' width='438' height='249'/>*/}
                {/*<figcaption className='wire-column__preview__caption'>Lorem ipsum dolor sit amet, consectetur adipiscing elit</figcaption>*/}
                {/*</figure>*/}
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
                        <span>{gettext('News Value: {{ value }}', {value: item.urgency || DEFAULT_URGENCY})}</span>
                        <span><span className='bold'>{wordCount(item.body_html)}</span> {gettext('words')}</span>
                        <span>{gettext('Source: {{ source }}', {source: item.source})}
                            {' // '}
                            <span className="blue-text">
                                {gettext('{{ count }} previous versions', {count: item.ancestors ? item.ancestors.length : 0})}
                            </span>
                        </span>
                    </div>
                </div>
                {item.description_text &&
                        <p className='wire-column__preview__lead'>{item.description_text}</p>
                }
                {item.body_html &&
                        <div className='wire-column__preview__text' id='preview-body' dangerouslySetInnerHTML={({__html: item.body_html})} />
                }

                <div className='wire-column__preview__tags'>
                    {subjects &&
                            <div className='column__preview__tags__column'>
                                <span className='wire-column__preview__tags__headline'>{gettext('Category')}</span>
                                {subjects}
                            </div>
                    }

                    {genres &&
                            <div className='column__preview__tags__column'>
                                <span className='wire-column__preview__tags__headline'>{gettext('Genre')}</span>
                                {genres}
                            </div>
                    }
                </div>

                <ListItemPreviousVersions item={item} isPreview={true} />

            </div>
        </div>
    );
}

Preview.propTypes = {
    item: PropTypes.object.isRequired,
    actions: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        action: PropTypes.func,
        url: PropTypes.func,
    })),
};

export default Preview;
