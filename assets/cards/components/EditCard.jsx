import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import TextInput from 'components/TextInput';
import AuditInformation from 'components/AuditInformation';
import SelectInput from 'components/SelectInput';

import { gettext } from 'utils';
import {
    CARD_TYPES,
    getCardEditComponent,
} from 'components/cards/utils';


class EditCard extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const dashboard = (get(this.props, 'dashboards') || []).find((d) => d._id === this.props.card.dashboard);
        const cardType = this.props.card.type || '';
        const CardComponent = getCardEditComponent(cardType);
        const cardTypes = CARD_TYPES.filter(
            (card) =>  dashboard.cards.includes(card._id)
        ).map((c) => ({value: c._id, text: c.text}));

        cardTypes.unshift({value: '', text: '', component: getCardEditComponent('')});

        const cardProps = {
            card: this.props.card,
            onChange: this.props.onChange,
            errors: this.props.errors
        };

        if (cardType.includes('navigation')) {
            cardProps.navigations = this.props.navigations;
        } else if (!['4-photo-gallery', '2x2-events'].includes(cardType)) {
            cardProps.products = this.props.products;
        }

        return (
            <div className='list-item__preview'>
                <div className='list-item__preview-header'>
                    <h3>{this.props.card.label}</h3>
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
                <AuditInformation item={this.props.card} />
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
                            value={`${this.props.card.order}`}
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
    navigations: PropTypes.arrayOf(PropTypes.object),
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    dashboards:  PropTypes.arrayOf(PropTypes.object),
};

export default EditCard;
