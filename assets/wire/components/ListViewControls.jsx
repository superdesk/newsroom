import React from 'react';
import PropTypes from 'prop-types';

import NewsOnlyControl from './NewsOnlyControl';
import ListViewOptions from '../../components/ListViewOptions';

function ListViewControls({activeView, setView, newsOnly, toggleNews, activeNavigation}) {
    return(
        <div className='content-bar__right'>
            <NewsOnlyControl
                activeNavigation={activeNavigation}
                newsOnly={newsOnly}
                toggleNews={toggleNews}
            />
            <ListViewOptions setView={setView} activeView={activeView} />
        </div>
    );
}


ListViewControls.propTypes = {
    activeView: PropTypes.string,
    setView: PropTypes.func.isRequired,
    newsOnly: PropTypes.bool,
    toggleNews: PropTypes.func,
    activeNavigation: PropTypes.string,
};

export default ListViewControls;
