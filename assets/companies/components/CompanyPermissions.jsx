import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {gettext} from 'utils';
import {get} from 'lodash';

import CheckboxInput from 'components/CheckboxInput';

import {savePermissions} from '../actions';

class CompanyPermissions extends Component {
    constructor(props) {
        super(props);
        this.state = this.setup();
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.togglePermission = this.togglePermission.bind(this);
    }

    setup() {
        const {company, sections, products} = this.props;

        const permissions = {
            sections: company.sections || sections.reduce((acc, section) => ({...acc, [section._id]: true}), {}),
            products: products.reduce((acc, product) => ({
                ...acc,
                [product._id]: get(product, 'companies', []).includes(company._id)
            }), {}),
            archive_access: company.archive_access || false,
            events_only: company.events_only || false,
            embedded: {
                social_media_display: get(company, 'embedded.social_media_display', false),
                video_display: get(company, 'embedded.video_display', false),
                audio_display: get(company, 'embedded.audio_display', false),
                images_display: get(company, 'embedded.images_display', false),
                all_display: get(company, 'embedded.all_display', false),
                social_media_download: get(company, 'embedded.social_media_download', false),
                video_download: get(company, 'embedded.video_download', false),
                audio_download: get(company, 'embedded.audio_download', false),
                images_download: get(company, 'embedded.images_download', false),
                all_download: get(company, 'embedded.all_download', false),
                sdpermit_display: get(company, 'embedded.sdpermit_display', false),
                sdpermit_download: get(company, 'embedded.sdpermit_download', false),
            },
        };

        return permissions;
    }

    componentDidUpdate(prevProps) {
        if (prevProps.company !== this.props.company) {
            this.setState(this.setup());
        }
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.savePermissions(this.props.company, this.state);
    }

    handleChange(key, value) {
        this.setState((prevState) => {
            if (key.startsWith('embedded.')) {
                const [, embeddedKey] = key.split('.');
                return {
                    ...prevState,
                    embedded: {
                        ...prevState.embedded,
                        [embeddedKey]: value,
                    },
                };
            } else {
                return {
                    ...prevState,
                    [key]: value,
                };
            }
        });
    }

    togglePermission(key, _id, value) {
        this.setState((prevState) => ({
            ...prevState,
            [key]: {
                ...prevState[key],
                [_id]: value,
            },
        }));
    }

    render() {
        const {sections, products} = this.props;
        const {
            archive_access,
            events_only,
            embedded = {},
        } = this.state;

        const optionLabels = {
            Display: 'Allow Visualization',
            Download: 'Allow Download'
        };
        return (
            <div className="tab-pane active" id="company-permissions">
                <form onSubmit={this.handleSubmit}>
                    <div className="list-item__preview-form" key="general">
                        <div className="form-group">
                            <label>{gettext('General')}</label>
                            <ul className="list-unstyled">
                                <li>
                                    <CheckboxInput
                                        name="archive_access"
                                        label={gettext('Grant Access To Archived Wire')}
                                        value={archive_access}
                                        onChange={() => this.handleChange('archive_access', !archive_access)}
                                    />
                                </li>
                                <li>
                                    <CheckboxInput
                                        name="events_only"
                                        label={gettext('Events Only Access')}
                                        value={events_only}
                                        onChange={() => this.handleChange('events_only', !events_only)}
                                    />
                                </li>
                            </ul>
                        </div>

                        <div className="form-group">
                            <label>{gettext('Content Permissions')}</label>
                            <p className="default-setting-text">
                                <strong>Default:</strong> All Content Types if none selected. Also SDpermit Media option
                                  can start to use it if required.
                            </p>
                            <div className="row">
                                {['Display', 'Download'].map((option) => (
                                    <div key={option} className="col-md-6">
                                        <div className="form-group">
                                            <label className="default-setting-text" ><strong>{optionLabels[option]} </strong></label>
                                            <ul className="list-unstyled">
                                                {[
                                                    {label: 'Images', key: 'images'},
                                                    {label: 'Audios', key: 'audio'},
                                                    {label: 'Videos', key: 'video'},
                                                    {label: 'Social Media', key: 'social_media'},
                                                    {label: 'SDpermit Media', key: 'sdpermit'},
                                                    {label: 'All Above', key: 'all'},
                                                ].map(({label, key}) => (
                                                    <li key={`${key}_${option.toLowerCase()}`}>
                                                        <CheckboxInput
                                                            name={`${key}_${option.toLowerCase()}`}
                                                            label={label}
                                                            value={embedded[`${key}_${option.toLowerCase()}`] || false}
                                                            onChange={() =>
                                                                this.handleChange(
                                                                    `embedded.${key}_${option.toLowerCase()}`,
                                                                    !embedded[`${key}_${option.toLowerCase()}`]
                                                                )
                                                            }
                                                        />
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-group" key="sections">
                            <label>{gettext('Sections')}</label>
                            <ul className="list-unstyled">
                                {sections.map((section) => (
                                    <li key={section._id}>
                                        <CheckboxInput
                                            name={section._id}
                                            label={section.name}
                                            value={this.state.sections[section._id] || false}
                                            onChange={(value) => this.togglePermission('sections', section._id, value)}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="form-group" key="products">
                            {sections.map((section) => (
                                <React.Fragment key={section._id}>
                                    <label>{gettext('Products')} {`(${section.name})`}</label>
                                    <ul className="list-unstyled">
                                        {products
                                            .filter((p) => (p.product_type || 'wire').toLowerCase() === section._id.toLowerCase())
                                            .map((product) => (
                                                <li key={product._id}>
                                                    <CheckboxInput
                                                        name={product._id}
                                                        label={product.name}
                                                        value={this.state.products[product._id] || false}
                                                        onChange={(value) => this.togglePermission('products', product._id, value)}
                                                    />
                                                </li>
                                            ))}
                                    </ul>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    <div className="list-item__preview-footer">
                        <input
                            type="submit"
                            className="btn btn-outline-primary"
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
        embedded: PropTypes.shape({
            social_media_display: PropTypes.bool,
            video_display: PropTypes.bool,
            audio_display: PropTypes.bool,
            images_display: PropTypes.bool,
            all_display: PropTypes.bool,
            sdpermit_display: PropTypes.bool,
            social_media_download: PropTypes.bool,
            video_download: PropTypes.bool,
            audio_download: PropTypes.bool,
            images_download: PropTypes.bool,
            sdpermit_download: PropTypes.bool,
            all_download: PropTypes.bool,
        }),
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
