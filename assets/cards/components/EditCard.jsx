import React from 'react';
import PropTypes from 'prop-types';
import TextInput from 'components/TextInput';
import SelectInput from 'components/SelectInput';

import { gettext } from 'utils';
import CardDetails from './CardDetails';
import EventDetails from './EventDetails';

const cardTypes = [
    {value: '', text: ''},
    {value: '6-text-only', text: gettext('6-text-only')},
    {value: '4-picture-text', text: gettext('4-picture-text')},
    {value: '4-media-gallery', text: gettext('4-media-gallery')},
    {value: '4-photo-gallery', text: gettext('4-photo-gallery')},
    {value: '4-text-only', text: gettext('4-text-only')},
    {value: '1x1-top-news', text: gettext('1x1-top-news')},
    {value: '2x2-top-news', text: gettext('2x2-top-news')},
    {value: '3-text-only', text: gettext('3-text-only')},
    {value: '3-picture-text', text: gettext('3-picture-text')},
    {value: '2x2-events', text: gettext('2x2-events')},
];


class EditCard extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const events = this.props.card.config.events || [{}, {}, {}, {}];
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
                            label={gettext('Order')}
                            value={this.props.card.order}
                            onChange={this.props.onChange}
                            error={this.props.errors ? this.props.errors.order : null}/>

                        {this.props.card.type !== '2x2-events' && <CardDetails
                            card={this.props.card}
                            onChange={this.props.onChange}
                            errors={this.props.errors}
                            products={this.props.products} />}

                        {this.props.card.type === '2x2-events' &&
                         events.map((event, index) => <EventDetails
                             key={`event${index}`}
                             event={event}
                             onChange={this.props.onChange}
                             errors={this.props.errors}
                             index={index} />)}



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
