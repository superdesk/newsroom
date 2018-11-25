import React from 'react';
import PropTypes from 'prop-types';
import CardMeta from './CardMeta';

function CardFooter({wordCount, pictureAvailable, source, versioncreated}) {
    return (<div className="card-footer">
        <CardMeta
            pictureAvailable={pictureAvailable}
            wordCount={wordCount}
            source={source}
            versioncreated={versioncreated}

        />
    </div>);
}

CardFooter.propTypes = {
    wordCount: PropTypes.number,
    pictureAvailable: PropTypes.bool,
    source: PropTypes.string,
    versioncreated: PropTypes.string,
};

export default CardFooter;