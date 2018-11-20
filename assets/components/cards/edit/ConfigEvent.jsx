import React from 'react';
import PropTypes from 'prop-types';
import TextInput from 'components/TextInput';
import FileInput from 'components/FileInput';
import DateInput from'components/DateInput';
import TextAreaInput from'components/TextAreaInput';

import { gettext } from 'utils';


function ConfigEvent ({card, onChange, errors}) {

    const events = card.config.events || [{}, {}, {}, {}];

    return (
        events.map((event, index) => {
            const prefix = `config.events[${index}].`;
            return (
                <div key={prefix} className='card' style={{display:'block', marginBottom: '20px'}}>
                    <div className='card-header'>
                        {`Event ${index + 1}`}
                    </div>
                    <div className='card-body'>
                        <TextInput
                            name={`${prefix}headline`}
                            label={gettext('Headline')}
                            value={event.headline}
                            onChange={onChange}
                            error={errors ? errors[`${prefix}headline`] : null}/>

                        <TextAreaInput
                            name={`${prefix}abstract`}
                            label={gettext('Abstract')}
                            value={event.abstract}
                            onChange={onChange}
                            error={errors ? errors[`${prefix}abstract`] : null}/>

                        <DateInput
                            name={`${prefix}startDate`}
                            label={gettext('Start Date')}
                            value={event.startDate}
                            onChange={onChange}
                            error={errors ? errors[`${prefix}startDate`] : null}
                            required={true}/>

                        <DateInput
                            name={`${prefix}endDate`}
                            label={gettext('End Date')}
                            value={event.endDate}
                            onChange={onChange}
                            error={errors ? errors[`${prefix}endDate`] : null}
                            required={false}/>

                        <TextInput
                            name={`${prefix}location`}
                            label={gettext('Location')}
                            value={event.location}
                            onChange={onChange}
                            error={errors ? errors[`${prefix}location`] : null}/>

                        {index < 2 && <FileInput
                            name={`${prefix}file`}
                            label={`${gettext('Image')} - ${event.file}`}
                            onChange={onChange}
                            error={errors ? errors[`${prefix}file`] : null} />}
                    </div>
                </div>
            );
        })
    );
}

ConfigEvent.propTypes = {
    event: PropTypes.object,
    onChange: PropTypes.func,
    errors: PropTypes.object,
    index: PropTypes.number,
};

export default ConfigEvent;