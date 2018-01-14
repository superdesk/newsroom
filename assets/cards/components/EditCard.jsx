import React from 'react';
import PropTypes from 'prop-types';
import TextInput from 'components/TextInput';
import SelectInput from 'components/SelectInput';

import { gettext } from 'utils';

const cardTypes = [
    {value: '', text: ''},
    {value: '6-text-only', text: gettext('6-text-only')},
    {value: '4-picture-text', text: gettext('4-picture-text')},
    {value: '4-media-gallery', text: gettext('4-media-gallery')},
    {value: '1x1-top-news', text: gettext('1x1-top-news')},
    {value: '2x2-top-news', text: gettext('2x2-top-news')},
];



class EditCard extends React.Component {
    constructor(props) {
        super(props);

        this.getProducts = this.getProducts.bind(this);
    }

    getProducts() {
        const productList = [{ value: '', text: '' }];
        this.props.products.map((product) => {
            productList.push({ value: product._id, text: product.name });
        });
        return productList;
    }

    render() {
        return (
            <div className='list-item__preview'>
                <div className='list-item__preview-header'>
                    <h3>{this.props.card.name}</h3>
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

                <form>
                    <div className="list-item__preview-form">
                        <TextInput
                            name='label'
                            label={gettext('Label')}
                            value={this.props.card.label}
                            onChange={this.props.onChange}
                            error={this.props.errors ? this.props.errors.name : null}/>

                        <SelectInput
                            name='type'
                            label={gettext('Type')}
                            value={this.props.card.type}
                            options={cardTypes}
                            onChange={this.props.onChange}
                            error={this.props.errors ? this.props.errors.type : null} />

                        <SelectInput
                            name='product'
                            label={gettext('Product')}
                            value={this.props.card.config.product}
                            options={this.getProducts()}
                            onChange={this.props.onChange}
                            error={this.props.errors ? this.props.errors.product : null} />


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
        );
    }
}

EditCard.propTypes = {
    card: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    errors: PropTypes.object,
    products: PropTypes.arrayOf(PropTypes.object),
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    saveProducts: PropTypes.func.isRequired,
    fetchProducts: PropTypes.func.isRequired,
};

export default EditCard;