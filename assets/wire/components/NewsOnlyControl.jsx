import React from 'react';
import PropTypes from 'prop-types';
import Toggle from 'react-toggle';
import {gettext} from 'utils';
import {noNavigationSelected} from 'search/utils';

function NewsOnlyControl ({newsOnly, toggleNews, activeNavigation}) {
    return !noNavigationSelected(activeNavigation) ? null : (
        <div className="d-flex align-items-center px-2 px-sm-3">
            <div className={'d-flex align-items-center'}>
                <label htmlFor='news-only' className="mr-2">{gettext('News only')}</label>
                <Toggle
                    id="news-only"
                    defaultChecked={newsOnly}
                    className='toggle-background'
                    icons={false}
                    onChange={toggleNews}/>
            </div>
        </div>
    );
}

NewsOnlyControl.propTypes = {
    newsOnly: PropTypes.bool,
    toggleNews: PropTypes.func,
    activeNavigation: PropTypes.arrayOf(PropTypes.string),
};


export default NewsOnlyControl;
