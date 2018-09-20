import React from 'react';
import PropTypes from 'prop-types';

import ListViewOptions from 'components/ListViewOptions';

function AgendaListViewControls({activeView, setView}) {
    return(
        <div className='content-bar__right'>
            <ListViewOptions setView={setView} activeView={activeView} />
        </div>
    );
}


AgendaListViewControls.propTypes = {
    activeView: PropTypes.string,
    setView: PropTypes.func.isRequired,
};

export default AgendaListViewControls;
