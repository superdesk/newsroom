import React from 'react';
import PropTypes from 'prop-types';
import Toggle from 'react-toggle';
import { gettext } from 'utils';

function NewsOnlyControl ({newsOnly, toggleNews, activeNavigation}) {
    return (
        <div className="content-bar__right">
            <div className="d-flex align-items-center px-2 px-sm-3">
                {!activeNavigation &&
                <div className={'d-flex align-items-center'}>
                    <label htmlFor='news-only' className="mr-2">{gettext('News only')}</label>
                    <Toggle
                        id="news-only"
                        defaultChecked={newsOnly}
                        className='toggle-background'
                        icons={false}
                        onChange={toggleNews}/>
                </div>}
            </div>
        </div>

    );
}

NewsOnlyControl.propTypes = {
    newsOnly: PropTypes.bool,
    toggleNews: PropTypes.func,
    activeNavigation: PropTypes.string,
};


export default NewsOnlyControl;
