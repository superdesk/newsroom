import React from 'react';
import PropTypes from 'prop-types';
import server from 'server';
import { get } from 'lodash';
import { gettext } from 'utils';
import { getCoverageStatusText } from '../utils';

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
        if (getDeliveryHref(get(prevProps, 'coverage')) !== getDeliveryHref(get(this.props, 'coverage'))) {
            this.setState({wire: null});
            this.fetchWire();
        }
    }

    render() {
        const {coverage} = this.props;

        const content = [
            <span className="coverage-item--element-grow" key="topRow">
                <span key="label" className='coverage-item__text-label mr-1'>{gettext('Status')}:</span>
                <span key="value">{gettext('coverage {{ state }} ',
                    {state: getCoverageStatusText(coverage)})}</span>
            </span>
        ];

        if (coverage.workflow_status === 'completed' && coverage.coverage_type === 'picture' && getDeliveryHref(coverage)) {
            content.push(
                <span key="contentLink" className="label label--available">
                    <a  href={coverage.delivery_href}
                        className="wire-column__preview__coverage__available-story"
                        target="_blank"
                        title={gettext('Open in new tab')}>
                        {gettext('View Content')}
                    </a>
                </span>
            );
        }

        if (coverage.workflow_status === 'completed' && this.state.wire) {
            content.push(
                this.state.wire._access
                    ? <span key="contentLink" className="label label--available">
                        <a className="wire-column__preview__coverage__available-story"
                            key="value"
                            href={'/wire?item='+ this.state.wire._id}
                            target="_blank"
                            title={gettext('Open in new tab')}>
                            {gettext('View Content')}
                        </a></span>
                    : <span key="contentLink" className="label label--restricted">
                        <a className="wire-column__preview__coverage__restricted-story"
                            key="value" href="#"
                            target="_blank">{gettext('View Content')}</a></span>
            );
        }

        return content;
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