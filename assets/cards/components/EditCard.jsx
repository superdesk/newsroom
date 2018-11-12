import React from 'react';
import PropTypes from 'prop-types';
import TextInput from 'components/TextInput';
import SelectInput from 'components/SelectInput';

import { gettext } from 'utils';
import CardDetails from './CardDetails';
import EventDetails from './EventDetails';
import ExternalMediaCardDetails from './ExternalMediaCardsDetails';


const cardTypes = [
    {value: '', text: '', component: CardDetails},
    {value: '6-text-only', text: gettext('6-text-only'), component: CardDetails},
    {value: '4-picture-text', text: gettext('4-picture-text'), component: CardDetails},
    {value: '4-media-gallery', text: gettext('4-media-gallery'), component: CardDetails},
    {value: '4-photo-gallery', text: gettext('4-photo-gallery'), component: ExternalMediaCardDetails},
    {value: '4-text-only', text: gettext('4-text-only'), component: CardDetails},
    {value: '1x1-top-news', text: gettext('1x1-top-news'), component: CardDetails},
    {value: '2x2-top-news', text: gettext('2x2-top-news'), component: CardDetails},
    {value: '3-text-only', text: gettext('3-text-only'), component: CardDetails},
    {value: '3-picture-text', text: gettext('3-picture-text'), component: CardDetails},
    {value: '2x2-events', text: gettext('2x2-events'), component: EventDetails},
];


class EditCard extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const cardType = this.props.card.type || '';
        const CardComponent = cardTypes.find((card) => card.value === cardType).component || CardDetails;
        const cardProps = {
            card: this.props.card,
            onChange: this.props.onChange,
            errors: this.props.errors
        };

        if (!['4-photo-gallery', '2x2-events'].includes(cardType)) {
            cardProps.products = this.props.products;
        }

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
                            error={this.props.errors ? this.props.errors.label : null}/>

                        <SelectInput
                            name='type'
                            label={gettext('Type')}
                            value={this.props.card.type}
                            options={cardTypes}
                            onChange={this.props.onChange}
                            error={this.props.errors ? this.props.errors.type : null} />

                        <TextInput
                            name='order'
                            type='number'
                            label={gettext('Order')}
                            value={this.props.card.order}
                            onChange={this.props.onChange}
                            error={this.props.errors ? this.props.errors.order : null}/>

                        <CardComponent {...cardProps}/>
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
};

export default EditCard;
