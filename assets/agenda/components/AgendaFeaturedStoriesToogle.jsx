import React from 'react';
import PropTypes from 'prop-types';
import Toggle from 'react-toggle';
import { gettext } from 'utils';

function AgendaFeaturedStoriesToogle ({featuredFilter, onChange}) {
    return (
        <div className="d-flex align-items-center px-2 px-sm-3">
            <div className={'d-flex align-items-center'}>
                <label htmlFor='featured-stories' className="mr-2 featured-stories__toggle-label-sm">{gettext('Top/Featured Stories')}</label>
                <label htmlFor='featured-stories' className="mr-2 featured-stories__toggle-label-xsm">{gettext('Top Stories')}</label>
                <Toggle
                    id="featured-stories"
                    checked={featuredFilter}
                    className='toggle-background'
                    icons={false}
                    onChange={onChange}/>
            </div>
        </div>

    );
}

AgendaFeaturedStoriesToogle.propTypes = {
    onChange: PropTypes.func,
    featuredFilter: PropTypes.bool,
};


export default AgendaFeaturedStoriesToogle;
