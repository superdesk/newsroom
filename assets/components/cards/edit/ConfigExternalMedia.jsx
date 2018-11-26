import React from 'react';
import PropTypes from 'prop-types';
import TextInput from 'components/TextInput';
import { gettext } from 'utils';
import {get} from 'lodash';


function ConfigExternalMedia ({card, onChange, errors}) {
    const sources = card.config.sources || [{}, {}, {}, {}];

    return (
        [
            <TextInput
                key="more_label"
                name="config.more_url_label"
                label={gettext('More button label')}
                value={card.config.more_url_label}
                onChange={onChange}
                error={errors ? get(errors, 'config.more_url_label', null) : null}/>,
            <TextInput
                key="more_url"
                name="config.more_url"
                label={gettext('More button url')}
                value={card.config.more_url}
                onChange={onChange}
                error={errors ? get(errors, 'config.more_url', null) : null}/>,
            <div className="alert alert-primary" key="info">
                {gettext('Total media count across all media config should be between 1 and 4.')}
            </div>,
            sources.map((source, index) => {
                const prefix = `config.sources[${index}].`;
                return (
                    <div key={prefix} className='card' style={{display:'block', marginBottom: '20px'}}>
                        <div className='card-header'>
                            {`Media Config ${index + 1}`}
                        </div>
                        <div className='card-body'>
                            <TextInput
                                name={`${prefix}url`}
                                label={gettext('External url to fetch media')}
                                value={source.url}
                                onChange={onChange}
                                error={errors ? get(errors, `${prefix}url`, null) : null}/>

                            <TextInput
                                name={`${prefix}count`}
                                type='number'
                                label={gettext('Media Count')}
                                value={source.count}
                                onChange={onChange}
                                error={errors ? get(errors, `${prefix}count`, null) : null}/>
                        </div>
                    </div>
                );
            })
        ]
    );
}

ConfigExternalMedia.propTypes = {
    card: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    errors: PropTypes.object,
};

export default ConfigExternalMedia;