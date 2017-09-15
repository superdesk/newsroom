import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { previewItem } from '../actions';

import Preview from './Preview';
import ItemsList from './ItemsList';
import SearchBar from './SearchBar';
import SearchResultsInfo from './SearchResultsInfo';

class WireApp extends React.Component {
    render() {
        const progressStyle = {width: '25%'};

        return (
            <div>
                <SearchBar />
                <div className="row">
                    {(this.props.isLoading ?
                        <div className="col">
                            <div className="progress">
                                <div className="progress-bar" style={progressStyle} />
                            </div>
                        </div>
                        :
                        <div className="col">
                            {this.props.activeQuery &&
                            <SearchResultsInfo totalItems={this.props.totalItems} query={this.props.activeQuery} />
                            }
                            <ItemsList
                                items={this.props.items}
                                onClick={this.props.previewItem}
                                activeItem={this.props.activeItem} />
                        </div>
                    )}
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
    isLoading: PropTypes.bool,
    activeQuery: PropTypes.string,
    totalItems: PropTypes.number,
};

const mapStateToProps = (state) => ({
    items: state.items.map((id) => state.itemsById[id]),
    itemToPreview: state.itemsById[state.previewItem],
    activeItem: state.activeItem,
    isLoading: state.isLoading,
    activeQuery: state.activeQuery,
    totalItems: state.totalItems,
});

const mapDispatchToProps = (dispatch) => ({
    previewItem: (_id) => dispatch(previewItem(_id))
});

export default connect(mapStateToProps, mapDispatchToProps)(WireApp);
