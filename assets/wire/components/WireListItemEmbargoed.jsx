import React from 'react';
import PropTypes from 'prop-types';
import { gettext, fullDate, getEmbargo } from '../../utils';

export default class WireListItemEmbargoed extends React.Component {
    constructor(props) {
        super(props);
        this.state = {embargo: getEmbargo(props.item)};
    }

    componentDidMount() {
        if (this.elem && this.state.embargo) {
            $(this.elem).tooltip({
                placement: 'bottom',
                title: fullDate(this.state.embargo),
            });
        }
    }

    componentWillUnmount() {
        if (this.elem) {
            $(this.elem).tooltip('dispose');
        }
    }

    render() {
        if (!this.state.embargo) {
            return null;
        }

        return (
            <span ref={(elem) => this.elem = elem} className="label label--red ml-4">{gettext('embargo')}</span>
        );
    }
}

WireListItemEmbargoed.propTypes = {
    item: PropTypes.shape({
        embargoed: PropTypes.string,
    }),
};