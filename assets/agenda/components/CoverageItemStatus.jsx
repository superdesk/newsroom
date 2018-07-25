import React from 'react';
import PropTypes from 'prop-types';
import server from 'server';
import { get } from 'lodash';
import { gettext } from 'utils';

function getDeliveryHref(coverage) {
    return get(coverage, 'delivery_href');
}

export default class CoverageItemStatus extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {wire: null};
        this.fetchWire();
    }

    fetchWire() {
        const url = getDeliveryHref(this.props.coverage);

        if (url) {
            server.getJson(url).then((wire) => {
                this.setState({wire});
            });
        }
    }

    componentDidUpdate(prevProps) {
        if (getDeliveryHref(prevProps) !== getDeliveryHref(this.props)) {
            this.setState({wire: null});
            this.fetchWire();
        }
    }

    render() {
        const {coverage} = this.props;

        if (coverage.coverage_status && !this.state.wire) {
            return [
                <span key="label" className='coverage-item__text-label mr-1'>{gettext('Status')}:</span>,
                <span key="value">{coverage.coverage_status}</span>,
            ];
        }

        if (this.state.wire) {
            return [
                <span key="label" className='coverage-item__text-label mr-1'>{gettext('Wire')}:</span>,
                <a key="value" href={'/wire?item='+ this.state.wire._id}>{this.state.wire.headline}</a>,
            ];
        }

        return null;
    }
}

CoverageItemStatus.propTypes = {
    coverage: PropTypes.shape({
        delivery_href: PropTypes.string,
        coverage_status: PropTypes.string,
    }),
};