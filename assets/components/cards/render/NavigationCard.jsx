import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { gettext } from 'utils';


const NavigationCard = ({navigation}) => {
    const imageUrl = (navigation) => {
        if (get(navigation, 'tile_images.length', 0) === 0) {
            return null;
        }

        const urls = get(navigation, 'tile_images', []).map((image) => image.file_url).filter((url) => url);

        if (urls.length === 1) {
            return urls[0];
        } else {
            const max = urls.length - 1;
            const min = 0;
            return urls[Math.floor(Math.random() * (max - min + 1)) + min];
        }
    };

    return (
        <div key={navigation._id} className="col-sm-6 col-md-4 col-xl-2 d-flex mb-4">
            <div className="card card--home">
                <a href={navigation.href}>
                    <img className="card-img-top" src={imageUrl(navigation)} alt={navigation.name} />
                    <div className="card-body">
                        <h4 className="card-title">{navigation.name}</h4>
                    </div>
                    {navigation.story_count && <div className="card-footer">
                        <div className="wire-articles__item__meta-info">
                            <span>{navigation.story_count} {gettext('Stories')}</span>
                        </div>
                    </div>}
                </a>
            </div>
        </div>
    );
};

NavigationCard.propTypes = {
    navigation: PropTypes.object.isRequired,
};

export default NavigationCard;