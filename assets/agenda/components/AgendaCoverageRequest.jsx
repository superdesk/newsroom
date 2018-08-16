import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { gettext } from 'utils';


class AgendaCoverageRequest extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.onRequestClick = this.onRequestClick.bind(this);
        this.reset = this.reset.bind(this);
        this.onMessageChange = this.onMessageChange.bind(this);
        this.requestCoverage = this.requestCoverage.bind(this);
        this.state = {opened: false, message: ''};
    }

    onRequestClick() {
        this.setState({opened: !this.state.opened});
    }

    reset() {
        this.setState({opened: false, message: '', status: null});
    }

    onMessageChange(event) {
        this.setState({message: event.target.value, status: null});
    }

    requestCoverage() {
        this.props.requestCoverage(this.props.item, this.state.message)
            .then(() => this.setState({'status': gettext('Your request has been sent successfully')}))
            .catch(() => this.setState({'status': gettext('Failed to send the request')}));
    }

    render() {
        return (<div className='collapsible'>
            <a href='#' className='collapsible__link' onClick={this.onRequestClick}>
                <i className={classNames('icon-small--arrow-down rotate-90-ccw mr-1', {'rotate-90-ccw': this.state.opened})}></i>
                {gettext('Request coverage')}
            </a>
            <div className={classNames({'collapsible__form': !this.state.opened})}>
                <div className='form-group'>
                    <div className='field'>
                        <textarea
                            className='form-control'
                            placeholder={gettext('your request')}
                            value={this.state.message}
                            onChange={this.onMessageChange}
                        ></textarea>
                    </div>
                </div>
                <div className='form-group'>
                    <input
                        type='button'
                        className='btn btn-outline-secondary'
                        value={gettext('Cancel')}
                        onClick={this.reset}
                    ></input>
                    <input
                        type='button'
                        className='btn btn-outline-primary ml-2'
                        value={gettext('Send Request')}
                        disabled={!this.state.message}
                        onClick={this.requestCoverage}
                    ></input>
                    {this.state.status && <i className='ml-2'>{this.state.status}</i>}
                </div>
            </div>
        </div>);
    }

}

AgendaCoverageRequest.propTypes = {
    item: PropTypes.object,
    requestCoverage: PropTypes.func,
};

export default AgendaCoverageRequest;