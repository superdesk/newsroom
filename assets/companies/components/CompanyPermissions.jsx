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

        this.groups = [
            {_id: 'sections', label: gettext('Sections')},
            {_id: 'products', label: gettext('Products')},
        ];

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

        return {sections, products, archive_access};
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

    getLabel(group, item) {
        if (group._id === 'products') {
            return `${item.name} [${item.product_type || 'wire'}]`;
        }

        return item.name;
    }

    render() {
        return (
            <div className='tab-pane active' id='company-permissions'>
                <form onSubmit={(event) => {
                    event.preventDefault();
                    this.props.savePermissions(this.props.company, this.state);
                }}>
                    <div className="list-item__preview-form">
                        <div className="form-group">
                            <label>{gettext('General')}</label>
                            <ul className="list-unstyled">
                                <li>
                                    <CheckboxInput
                                        name="archive_access"
                                        label={gettext('Archive access')}
                                        value={!!this.state.archive_access}
                                        onChange={() => this.setState({archive_access: !this.state.archive_access})}
                                    />
                                </li>
                            </ul>
                        </div>

                        {this.groups.map((group) => (
                            <div className="form-group" key={group._id}>
                                <label>{group.label}</label>
                                <ul className="list-unstyled">
                                    {this.props[group._id].map((item) => (
                                        <li key={item._id}>
                                            <CheckboxInput
                                                name={item._id}
                                                label={this.getLabel(group, item)}
                                                value={!!this.state[group._id][item._id]}
                                                onChange={() => this.toggle(group._id, item._id)} />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
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
