import React from 'react';
import PropTypes from 'prop-types';
import {gettext} from 'utils';
import {connect} from 'react-redux';
import {get, sortBy} from 'lodash';

import {save} from '../actions';

import TextInput from 'components/TextInput';
import AuditInformation from 'components/AuditInformation';

function isInput(field) {
    return field.type === 'text' || field.type === 'number';
}

class GeneralSettingsApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            values: {},
            _updated: get(this.props, 'config._updated'),
        };
        Object.keys(props.config).forEach((key) => {
            this.state.values[key] = get(props.config[key], 'value') || '';
        });

        this.onSubmit = this.onSubmit.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.updatedTime !== this.props.updatedTime) {
            this.setState({
                _updated: nextProps.updatedTime
            });
        }
    }

    onChange(key, val) {
        const values = {...this.state.values, [key]: val};
        this.setState({values});
    }

    onSubmit(event) {
        event.preventDefault();
        this.props.save(this.state.values);
    }

    render() {
        const {config} = this.props;
        const fields = sortBy(Object.keys(config), (_id) => config[_id].weight).map((_id) => {
            const field = config[_id];
            if (isInput(field)) {
                return (
                    <TextInput
                        key={_id}
                        type={field.type}
                        name={_id}
                        label={gettext(field.label)}
                        value={this.state.values[_id]}
                        placeholder={field.default}
                        onChange={(event) => this.onChange(_id, event.target.value)}
                        description={gettext(field.description)}
                        min={field.min}
                    />
                );
            }
            return null;
        });
        const audit = {
            '_updated': this.props.updatedTime,
            'version_creator': this.props.versionCreator
        };

        return (
            <div className="flex-row">
                <div className="flex-col flex-column">
                    <section className="content-main">
                        <div className="list-items-container">
                            <AuditInformation item={audit} noPadding/>
                            <form onSubmit={this.onSubmit}>
                                {fields}

                                <button type="submit" className="btn btn-primary">{gettext('Save')}</button>
                            </form>
                        </div>
                    </section>
                </div>
            </div>
        );
    }
}

GeneralSettingsApp.propTypes = {
    config: PropTypes.object.isRequired,
    save: PropTypes.func.isRequired,
    updatedTime: PropTypes.string,
    versionCreator: PropTypes.string,
};

const mapStateToProps = (state) => ({
    config: state.config,
    updatedTime: state._updated,
    versionCreator: state.version_creator,
});

const mapDispatchToProps = {
    save,
};

export default connect(mapStateToProps, mapDispatchToProps)(GeneralSettingsApp);
