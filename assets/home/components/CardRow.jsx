import React from 'react';
import PropTypes from 'prop-types';
import MoreNewsButton from './MoreNewsButton';


class CardRow extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        if (this.props.isActive) {
            this.cardElem.scrollIntoView({behavior: 'instant', block: 'end', inline: 'nearest'});
        }
    }

    render() {
        return (
            <div className='row' ref={(elem) => this.cardElem = elem}>
                {this.props.moreNews && <MoreNewsButton
                    title={this.props.title}
                    product={this.props.product}/>}
                {this.props.children}
            </div>
        );
    }
}

CardRow.propTypes = {
    title: PropTypes.string,
    product: PropTypes.object,
    isActive: PropTypes.bool,
    children: PropTypes.node.isRequired,
    moreNews: PropTypes.bool,
};

CardRow.defaultProps = {
    moreNews: true
};

export default CardRow;
