import React from 'react';
import PropTypes from 'prop-types';
import CardMeta from './CardMeta';

function CardFooter({wordCount, charCount, pictureAvailable, source, versioncreated, listConfig}) {
    return (<div className="card-footer">
        <CardMeta
            pictureAvailable={pictureAvailable}
            wordCount={wordCount}
            source={source}
            versioncreated={versioncreated}
            listConfig={listConfig}
        />
    </div>);
}

CardFooter.propTypes = {
    wordCount: PropTypes.number,
    charCount: PropTypes.number,
    pictureAvailable: PropTypes.bool,
    source: PropTypes.string,
    versioncreated: PropTypes.string,
    listConfig: PropTypes.object,
};

export default CardFooter;
