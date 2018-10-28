import React from 'react';
import PropTypes from 'prop-types';
import server from 'server';
import { get } from 'lodash';
import { gettext } from 'utils';
import { WORKFLOW_STATUS_TEXTS } from '../utils';

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

        if (url && this.props.coverage.coverage_type === 'text') {
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

        if (coverage.workflow_status && !this.state.wire) {
            return [
                <span key="label" className='coverage-item__text-label mr-1'>{gettext('Status')}:</span>,
                <span key="value">{gettext('coverage {{ state }} ',
                    {state: get(WORKFLOW_STATUS_TEXTS, coverage.workflow_status, '')})}</span>,
            ];
        }

        if (this.state.wire) {
            return [
                <span key="label" className='coverage-item__text-label mr-1'>{gettext('Wire')}:</span>,
                this.state.wire._access
                    ? <a className="wire-column__preview__coverage__available-story"
                        key="value"
                        href={'/wire?item='+ this.state.wire._id}
                        target="_blank"
                        title={gettext('Open in new tab')}>{this.state.wire.headline}</a>
                    : <a className="wire-column__preview__coverage__restricted-story"
                        key="value" href={'/wire/' + this.state.wire._id}
                        target="_blank">{this.state.wire.headline}
                    </a>
                ,
            ];
        }

        if (coverage.workflow_status === 'completed' && coverage.coverage_type === 'picture' && getDeliveryHref(coverage)) {
            return [
                <span key="label" className='coverage-item__text-label mr-1'>{gettext('Picture')}:</span>,
                <a className="wire-column__preview__coverage__available-story"
                    key="picture"
                    href={coverage.delivery_href}
                    target="_blank"
                    title={gettext('Open in new tab')}>{this.state.wire.headline || coverage.slugline}</a>
            ];
        }

        return null;
    }
}

CoverageItemStatus.propTypes = {
    coverage: PropTypes.shape({
        delivery_href: PropTypes.string,
        coverage_status: PropTypes.string,
        workflow_status: PropTypes.string,
        coverage_type: PropTypes.string,
    }),
};