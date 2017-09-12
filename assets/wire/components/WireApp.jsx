import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { previewItem } from '../actions';

import Preview from './Preview';
import ItemsList from './ItemsList';
import SearchBar from './SearchBar';

class WireApp extends React.Component {
    render() {
        return (
            <div>
                <SearchBar />
                <div className="row">
                    <ItemsList
                        items={this.props.items}
                        onClick={this.props.previewItem}
                        activeItem={this.props.activeItem} />
                    {this.props.itemToPreview &&
                        <Preview item={this.props.itemToPreview} />
                    }
                </div>
            </div>
        );
    }
}

WireApp.propTypes = {
    items: PropTypes.arrayOf(PropTypes.object),
    itemToPreview: PropTypes.object,
    activeItem: PropTypes.string,
    previewItem: PropTypes.func,
};

const mapStateToProps = (state) => ({
    items: state.items.map((id) => state.itemsById[id]),
    itemToPreview: state.itemsById[state.previewItem],
    activeItem: state.activeItem,
});

const mapDispatchToProps = (dispatch) => ({
    previewItem: (_id) => dispatch(previewItem(_id))
});

export default connect(mapStateToProps, mapDispatchToProps)(WireApp);
