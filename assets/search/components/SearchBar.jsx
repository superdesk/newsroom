import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {connect} from 'react-redux';

import {gettext} from 'utils';

import {searchQuerySelector} from 'search/selectors';

class SearchBar extends React.Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onClear = this.onClear.bind(this);
        this.state = {query: props.query || ''};
    }

    onChange(event) {
        this.setState({query: event.target.value});
    }

    onSubmit(event) {
        event.preventDefault();
        this.setAndFetch(this.state.query);
    }

    onClear(){
        this.setAndFetch();
        this.setState({query: ''});
    }

    setAndFetch(q = '') {
        if (this.props.enableQueryAction) {
            this.props.setQuery(q);
            this.props.fetchItems();
        } else {
            this.props.fetchItems(q);
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({query: nextProps.query});
    }

    render() {
        return (
            <div className="search form-inline">
                <span className="search__icon">
                    <i className="icon--search icon--gray-light" />
                </span>
                <div className={classNames('search__form input-group', {
                    'searchForm--active': !!this.state.query,
                })}>
                    <form className='form-inline' onSubmit={this.onSubmit}>
                        <input type='text'
                            name='q'
                            className='search__input form-control'
                            placeholder={gettext('Search for...')}
                            aria-label={gettext('Search for...')}
                            value={this.state.query || ''}
                            onChange={this.onChange}
                        />
                        <div className='search__form__buttons'>
                            <span className='search__clear' onClick={this.onClear}>
                                <img src='/static/search_clear.png' width='16' height='16'/>
                            </span>
                            <button className='btn btn-outline-secondary' type='submit'>
                                {gettext('Search')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

SearchBar.propTypes = {
    query: PropTypes.string,
    setQuery: PropTypes.func,
    fetchItems: PropTypes.func,
    enableQueryAction: PropTypes.bool,
};

const mapStateToProps = (state) => ({
    query: searchQuerySelector(state),
});

SearchBar.defaultProps = {enableQueryAction: true};

export default connect(mapStateToProps, null)(SearchBar);
