import React from 'react';
import PropTypes from 'prop-types';
import {gettext} from 'utils';
import {Typeahead} from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Typeahead-bs4.css';
import classNames from 'classnames';
import AgendaFilterButton from './AgendaFilterButton';


const getActiveTypeahead = (filter, activeFilter) => {
    return activeFilter[filter.field] ? activeFilter[filter.field][0] : [];
};
const processBuckets = (buckets) => buckets.map((bucket) => bucket.key).sort();

class AgendaTypeAheadFilter extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = { dropdownOpen: false };

        this.dom = {};
        this.toggleDropdown = this.toggleDropdown.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    toggleDropdown() {
        if (this.state.dropdownOpen) {
            // closing: remove event handler
            document.removeEventListener('click', this.handleClickOutside);
        } else {
            // opening dropdown: add event listener
            document.addEventListener('click', this.handleClickOutside);
        }

        this.setState({ dropdownOpen: !this.state.dropdownOpen });
    }

    handleClickOutside(e) {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }

        if (!this.dom.list || this.dom.list.contains(event.target) || !document.contains(event.target) ||
            !this.state.dropdownOpen) {
            return;
        }

        this.toggleDropdown();
    }
   
    onChange(selected) {
        this.toggleDropdown();
        this.props.toggleFilter(this.props.filter.field, selected.length ? selected : null);
    }

    render() {
        const {aggregations, filter, toggleFilter, activeFilter, getDropdownItems} = this.props;

        return (<div className="btn-group" key={filter.field} ref={(ref) => this.dom.list = ref}>
            <AgendaFilterButton
                filter={filter}
                activeFilter={activeFilter}
                autoToggle={false}
                onClick={this.toggleDropdown}
            />
            <div className={classNames('dropdown-menu dropdown-menu-typeahead', {'show': this.state.dropdownOpen})}
                aria-labelledby={filter.field}>
                <button
                    type='button'
                    className='dropdown-item'
                    onClick={this.onChange}
                >{gettext(filter.label)}</button>
                <div className='dropdown-divider'></div>
                <Typeahead
                    labelKey={filter.label}
                    onChange={this.onChange}
                    options={getDropdownItems(filter, aggregations, toggleFilter, processBuckets)}
                    placeholder={gettext('Choose a location...')}
                    selected={getActiveTypeahead(filter, activeFilter)}
                    className='p-2'
                />
            </div>
        </div>);
    }
}

AgendaTypeAheadFilter.propTypes = {
    aggregations: PropTypes.object,
    filter: PropTypes.object,
    toggleFilter: PropTypes.func,
    activeFilter: PropTypes.object,
    getDropdownItems: PropTypes.func,
};

export default AgendaTypeAheadFilter;
