import React from 'react';
import PropTypes from 'prop-types';
import 'react-toggle/style.css';
import {connect} from 'react-redux';
import {isEmpty, get} from 'lodash';

import {gettext} from 'utils';

import {
    searchParamsSelector,
} from 'search/selectors';

import SearchResults from './SearchResults';
import NewItemsIcon from './NewItemsIcon';

class SearchResultsInfo extends React.Component {
    constructor(props) {
        super(props);

        this.saveMyTopic = this.saveMyTopic.bind(this);
    }

    saveMyTopic() {
        this.props.saveMyTopic(Object.assign(
            {},
            this.props.activeTopic,
            this.props.searchParams,
            {topic_type: this.props.topicType},
            {filter: get(this.props, 'searchParams.filter', null)})
        );
    }

    render() {
        const saveButtonText = get(this.props, 'activeTopic._id') ?
            gettext('Update my topic') :
            gettext('Create my topic');

        return (
            <SearchResults
                scrollClass={this.props.scrollClass}
                showTotalItems={this.props.showTotalItems}
                showTotalLabel={this.props.showTotalLabel}
                showSaveTopic={this.props.showSaveTopic}
                totalItems={this.props.totalItems}
                totalItemsLabel={this.props.totalItemsLabel}
                saveMyTopic={this.saveMyTopic}
                saveButtonText={saveButtonText}
            >
                {isEmpty(this.props.newItems) ? null : (
                    <NewItemsIcon
                        newItems={this.props.newItems}
                        refresh={this.props.refresh}
                    />
                )}
            </SearchResults>
        );
    }
}

SearchResultsInfo.propTypes = {
    scrollClass: PropTypes.string,

    showTotalItems: PropTypes.bool,
    showTotalLabel: PropTypes.bool,
    showSaveTopic: PropTypes.bool,

    totalItems: PropTypes.number,
    totalItemsLabel: PropTypes.string,

    saveMyTopic: PropTypes.func,
    searchParams: PropTypes.object,
    activeTopic: PropTypes.object,
    topicType: PropTypes.string,

    newItems: PropTypes.array,
    refresh: PropTypes.func,
};

SearchResultsInfo.defaultProps = {
    showTotalItems: true,
    showTotalLabel: true,
    showSaveTopic: false,
};

const mapStateToProps = (state) => ({
    searchParams: searchParamsSelector(state),
});

export default connect(mapStateToProps, null)(SearchResultsInfo);
