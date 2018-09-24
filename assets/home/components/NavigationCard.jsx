import React from 'react';
import PropTypes from 'prop-types';
import { getNavigationImageUrl } from '../utils';
import { gettext } from 'utils';


const NavigationCard = ({navigation, onClickHandler}) => {
    const imageUrl = getNavigationImageUrl(navigation);
    return (
        <div key={navigation._id} className="col-sm-6 col-lg-3 d-flex mb-4">
            <div className="card card--home" onClick={() => onClickHandler(navigation)}>
                <img className="card-img-top" src={imageUrl} alt={navigation.name} />
                <div className="card-body">
                    <h4 className="card-title">{navigation.name}</h4>
                </div>
                {navigation.story_count && <div className="card-footer">
                    <div className="wire-articles__item__meta-info">
                        <span>{navigation.story_count} {gettext('Stories')}</span>
                    </div>
                </div>}
            </div>
        </div>
    );
};

NavigationCard.propTypes = {
    navigation: PropTypes.object.isRequired,
    onClickHandler: PropTypes.func.isRequired
};

export default NavigationCard;