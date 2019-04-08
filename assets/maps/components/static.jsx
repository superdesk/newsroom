import React from 'react';
import PropTypes from 'prop-types';
import { getMapSource } from '../utils';


class StaticMap extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            mapLoaded: false
        };
        this.handleMapError = this.handleMapError.bind(this);
        this.handleMapLoaded = this.handleMapLoaded.bind(this);
    }

    handleMapLoaded() {
        this.setState({mapLoaded: true});
    }

    handleMapError() {
        this.setState({mapLoaded: false});
    }

    render() {
        const src = getMapSource(this.props.locations, this.props.scale);

        return (
            <img
                style={this.state.mapLoaded ? {} : {display: 'none'}}
                src={src}
                width="640"
                height="640"
                onLoad={this.handleMapLoaded}
                onError={this.handleMapError}
            />
        );
    }
}

StaticMap.propTypes = {
    scale: PropTypes.number,
    locations: PropTypes.arrayOf(PropTypes.object),
};

export default StaticMap;
