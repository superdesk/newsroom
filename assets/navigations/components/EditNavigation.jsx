import React from 'react';
import PropTypes from 'prop-types';
import TextInput from 'components/TextInput';
import CheckboxInput from 'components/CheckboxInput';
import EditPanel from 'components/EditPanel';
import FileInput from 'components/FileInput';
import { get } from 'lodash';

import { gettext } from 'utils';
import { sectionsPropType } from 'features/sections/types';
import {MAX_TILE_IMAGES} from '../actions';
import AuditInformation from 'components/AuditInformation';


class EditNavigation extends React.Component {
    constructor(props) {
        super(props);
        this.handleTabClick = this.handleTabClick.bind(this);
        this.state = {activeTab: 'navigation-details'};

        this.tabs = [
            {label: gettext('Navigation'), name: 'navigation-details'},
            {label: gettext('Products'), name: 'products'}
        ];
    }

    handleTabClick(event) {
        this.setState({activeTab: event.target.name});
        if(event.target.name === 'products' && this.props.navigation._id) {
            this.props.fetchProducts();
        }
    }

    getNavigationProducts() {
        const products = this.props.products.filter((product) =>
            product.navigations && product.navigations.includes(this.props.navigation._id)
        ).map(p => p._id);

        return {_id: this.props.navigation._id, products};
    }

    render() {
        const tile_images = get(this.props, 'navigation.tile_images') || [];
        const getActiveSection = () => this.props.sections.filter(
            s => s._id === get(this.props.navigation, 'product_type')
        );

        return (
            <div className='list-item__preview'>
                <div className='list-item__preview-header'>
                    <h3>{this.props.navigation.name}</h3>
                    <button
                        id='hide-sidebar'
                        type='button'
                        className='icon-button'
                        data-dismiss='modal'
                        aria-label='Close'
                        onClick={this.props.onClose}>
                        <i className="icon--close-thin icon--gray" aria-hidden='true'></i>
                    </button>
                </div>
                <AuditInformation item={this.props.navigation} />

                <ul className='nav nav-tabs'>
                    {this.tabs.map((tab) => (
                        <li key={tab.name} className='nav-item'>
                            <a
                                name={tab.name}
                                className={`nav-link ${this.state.activeTab === tab.name && 'active'}`}
                                href='#'
                                onClick={this.handleTabClick}>{tab.label}
                            </a>
                        </li>
                    ))}
                </ul>

                <div className='tab-content'>
                    {this.state.activeTab === 'navigation-details' &&
                        <div className='tab-pane active' id='navigation-details'>
                            <form>
                                <div className="list-item__preview-form">
                                    <TextInput
                                        name='name'
                                        label={gettext('Name')}
                                        value={this.props.navigation.name}
                                        onChange={this.props.onChange}
                                        error={this.props.errors ? this.props.errors.name : null}/>

                                    <TextInput
                                        name='description'
                                        label={gettext('Description')}
                                        value={this.props.navigation.description}
                                        onChange={this.props.onChange}
                                        error={this.props.errors ? this.props.errors.description : null}/>

                                    <CheckboxInput
                                        name='is_enabled'
                                        label={gettext('Enabled')}
                                        value={this.props.navigation.is_enabled}
                                        onChange={this.props.onChange}/>

                                    <div className="card mt-3 d-block">
                                        <div className="card-header">{gettext('Tile Images')}</div>
                                        <div className="card-body">
                                            {[...Array(MAX_TILE_IMAGES)].map((_, index) => (
                                                <FileInput key={index}
                                                    name={`tile_images_file_${index}`}
                                                    label={get(tile_images, `[${index}.file]`) ||
                                                    `${gettext('Upload Image')} ${index + 1}`}
                                                    onChange={this.props.onChange}
                                                    error={this.props.errors ? this.props.errors.tile_images : null}/>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className='list-item__preview-footer'>
                                    <input
                                        type='button'
                                        className='btn btn-outline-primary'
                                        value={gettext('Save')}
                                        onClick={this.props.onSave}/>
                                    <input
                                        type='button'
                                        className='btn btn-outline-secondary'
                                        value={gettext('Delete')}
                                        onClick={this.props.onDelete}/>
                                </div>
                            </form>
                        </div>
                    }
                    {this.state.activeTab === 'products' &&
                        <EditPanel
                            parent={this.getNavigationProducts()}
                            items={this.props.products}
                            field="products"
                            onSave={this.props.saveProducts}
                            groups={getActiveSection()}
                            groupField={'product_type'}
                            groupDefaultValue={'wire'}
                        />
                    }
                </div>
            </div>
        );
    }
}

EditNavigation.propTypes = {
    navigation: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    errors: PropTypes.object,
    products: PropTypes.arrayOf(PropTypes.object),
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    saveProducts: PropTypes.func.isRequired,
    fetchProducts: PropTypes.func.isRequired,
    sections: sectionsPropType,
};

export default EditNavigation;
