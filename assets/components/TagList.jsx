import React from 'react';
import PropTypes from 'prop-types';
import {get} from 'lodash';

export default function TagList({tags, onClick, icon}) {
    return ((get(tags, 'length', 0) > 0 && <div className='tag-list'>
        <ul>
            {tags.map((t, index) => (
                <li className='noselect' key={index}>
                    {icon && <i className={icon} onClick={onClick ? onClick.bind(null, index) : null}/>}
                    {t}
                </li>
            ))}
        </ul>
    </div>) || null);
}

TagList.propTypes = {
    icon: PropTypes.string,
    tags: PropTypes.array,
    onClick: PropTypes.func,
};
