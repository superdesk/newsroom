import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { gettext } from 'utils';
import { get } from 'lodash';

import CheckboxInput from 'components/CheckboxInput';

import {savePermissions} from '../actions';

class CompanyPermissions extends React.Component {

    constructor(props) {
        super(props);
        this.state = this.setup();
    }

    setup() {
        const products = {};

        this.props.products.forEach((product) => {
            products[product._id] = get(product, 'companies', []).includes(this.props.company._id);
        });

        const sections = {};

        if (this.props.company.sections) {
            Object.assign(sections, this.props.company.sections);
        } else {
            this.props.sections.forEach((section) => {
                sections[section._id] = true;
            });
        }

        const archive_access = !!this.props.company.archive_access;
        const events_only = !!this.props.company.events_only;

        return {sections, products, archive_access, events_only};
    }

    componentDidUpdate(prevProps) {
        if (prevProps.company !== this.props.company) {
            this.setState(this.setup());
        }
    }

    toggle(key, _id) {
        const field = this.state[key];
        field[_id] = !field[_id];
        this.setState({[key]: field});
    }

    render() {
        return (
            <div className='tab-pane active' id='company-permissions'>
                <form onSubmit={(event) => {
                    event.preventDefault();
                    this.props.savePermissions(this.props.company, this.state);
                }}>
                    <div className="list-item__preview-form" key='general'>
                        <div className="form-group">
                            <label>{gettext('General')}</label>
                            <ul className="list-unstyled">
                                <li>
                                    <CheckboxInput
                                        name="archive_access"
                                        label={gettext('Grant Access To Archived Wire')}
                                        value={!!this.state.archive_access}
                                        onChange={() => this.setState({archive_access: !this.state.archive_access})}
                                    />
                                </li>
                                <li>
                                    <CheckboxInput
                                        name="events_only"
                                        label={gettext('Events Only Access')}
                                        value={!!this.state.events_only}
                                        onChange={() => this.setState({events_only: !this.state.events_only})}
                                    />
                                </li>
                            </ul>
                        </div>

                        <div className="form-group" key='sections'>
                            <label>{gettext('Sections')}</label>
                            <ul className="list-unstyled">
                                {this.props['sections'].map((item) => (
                                    <li key={item._id}>
                                        <CheckboxInput
                                            name={item._id}
                                            label={item.name}
                                            value={!!this.state['sections'][item._id]}
                                            onChange={() => this.toggle('sections', item._id)} />
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="form-group" key='products'>
                            {this.props['sections'].map((section) => (
                                [<label key={`${section.id}label`}>{gettext('Products')} {`(${section.name})`}</label>,
                                    <ul key={`${section.id}product`} className="list-unstyled">
                                        {this.props['products'].filter((p) => (p.product_type || 'wire').toLowerCase() === section._id.toLowerCase())
                                            .map((product) => (
                                                <li key={product._id}>
                                                    <CheckboxInput
                                                        name={product._id}
                                                        label={product.name}
                                                        value={!!this.state['products'][product._id]}
                                                        onChange={() => this.toggle('products', product._id)} />
                                                </li>
                                            ))}
                                    </ul>]
                            ))}
                        </div>

                    </div>
                    <div className='list-item__preview-footer'>
                        <input
                            type='submit'
                            className='btn btn-outline-primary'
                            value={gettext('Save')}
                        />
                    </div>
                </form>
            </div>
        );
    }
}

CompanyPermissions.propTypes = {
    company: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        sections: PropTypes.object,
        archive_access: PropTypes.bool,
        events_only: PropTypes.bool,
    }).isRequired,

    sections: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
    })),
    products: PropTypes.arrayOf(PropTypes.object).isRequired,

    savePermissions: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
    sections: state.sections,
    products: state.products,
});

const mapDispatchToProps = {
    savePermissions,
};

export default connect(mapStateToProps, mapDispatchToProps)(CompanyPermissions);
