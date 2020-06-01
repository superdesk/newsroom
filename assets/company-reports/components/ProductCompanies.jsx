import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import { get } from 'lodash';
import DropdownFilter from '../../components/DropdownFilter';
import ReportsTable from './ReportsTable';
import {toggleFilterAndQuery, runReport} from '../actions';

import { gettext } from 'utils';

class ProductCompanies extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.products = [...this.props.products.map((p) => ({...p, 'label': p.name}))];
        this.state = { product: this.props.products[0] };

        this.filters = [{
            label: gettext('All Products'),
            field: 'product'
        }];
        this.getDropdownItems = this.getDropdownItems.bind(this);
        this.results = [];
    }

    getDropdownItems(filter) {
        const { toggleFilterAndQuery } = this.props;
        let getName = (text) => (text);
        let itemsArray = [];
        switch (filter.field) {
        case 'product':
            itemsArray = this.products;
            break;
        }

        return itemsArray.map((item, i) => (<button
            key={i}
            className='dropdown-item'
            onClick={() => toggleFilterAndQuery(filter.field, item.name)}
        >{getName(item.name)}</button>));
    }

    getFilterLabel(filter, activeFilter) {
        if (activeFilter[filter.field]) {
            return activeFilter[filter.field];
        } else {
            return filter.label;
        }
    }

    render() {
        const {results, print, reportParams, toggleFilterAndQuery} = this.props;
        const headers = [gettext('Product'), gettext('Active Companies'), gettext('Disabled Companies')];
        const list = get(results, 'length', 0) > 0 ? results.map((item) =>
            <tr key={item._id}>
                <td>{item.product}</td>
                <td>{item.enabled_companies.map((company) => (
                    <Fragment key={company}>
                        {company}<br />
                    </Fragment>
                ))}</td>
                <td>{item.disabled_companies.map((company) => (
                    <Fragment key={company}>
                        {company}<br />
                    </Fragment>
                ))}</td>
            </tr>
        ) : ([(<tr key='no_data_row'>
            <td></td>
            <td></td>
            <td></td>
        </tr>)]);

        let filterNodes = this.filters.map((filter) => (
            <DropdownFilter
                key={filter.label}
                filter={filter}
                getDropdownItems={this.getDropdownItems}
                activeFilter={reportParams}
                getFilterLabel={this.getFilterLabel}
                toggleFilter={toggleFilterAndQuery}
            />
        ));
        const filterSection = (<div key='report_filters' className="align-items-center d-flex flex-sm-nowrap flex-wrap m-0 px-3 wire-column__main-header-agenda">{filterNodes}</div>);

        return [filterSection,
            (<ReportsTable key='report_table' headers={headers} rows={list} print={print} />)];

    }
}

ProductCompanies.propTypes = {
    results: PropTypes.array,
    print: PropTypes.bool,
    products: PropTypes.array,
    reportParams: PropTypes.object,
    toggleFilterAndQuery: PropTypes.func,
    runReport: PropTypes.func,
    isLoading: PropTypes.bool,
};

const mapStateToProps = (state) => ({
    products: state.products,
    reportParams: state.reportParams,
    isLoading: state.isLoading,
});

const mapDispatchToProps = { toggleFilterAndQuery, runReport};

export default connect(mapStateToProps, mapDispatchToProps)(ProductCompanies);
