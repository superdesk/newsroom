import React from 'react';
import PropTypes from 'prop-types';
import { get, keyBy } from 'lodash';

import SelectInput from 'components/SelectInput';
import SortItems from 'components/SortItems';
import { gettext, notify } from 'utils';


class ConfigNavigation extends React.Component {
    constructor(props) {
        super(props);

        this.getNavigations = this.getNavigations.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onAdd = this.onAdd.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.navigationsById = keyBy(props.navigations, '_id');
        this.getCardNavigations = this.getCardNavigations.bind(this);
        this.state = {
            selected: null,
            items: this.getCardNavigations(get(props.card, 'config.navigations') || [])
        };
    }

    getCardNavigations(items) {
        return items ? items.map(
            item => ({
                value: this.navigationsById[item]._id,
                text: this.navigationsById[item].name,
            })
        ) : [];
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.card._id !== this.props.card._id) {
            this.setState({items: this.getCardNavigations(get(nextProps.card, 'config.navigations') || [])});
        }
    }

    getNavigations() {
        const navigationList = [{ value: '', text: '' }];
        const dashboard = this.props.card.dashboard === 'newsroom' ? 'wire' : this.props.card.dashboard;
        this.props.navigations.forEach((navigation) => {
            if (!(get(this.props.card.config.navigations) || []).includes(navigation._id) &&
                navigation.product_type === dashboard) {
                navigationList.push({ value: navigation._id, text: navigation.name });
            }
        });
        return navigationList;
    }

    onAdd(navigation) {
        if(!navigation) {
            notify.error(gettext('Select a navigation.'));
            return;
        }

        if (this.state.items.find((item) => item.value === navigation)) {
            notify.error(gettext('Navigation is already added.'));
            return;
        }

        const nav = this.navigationsById[navigation];

        this.onChange([...this.state.items, {text: nav.name, value:nav._id}]);
    }

    onSelect(event) {
        this.setState({selected: event.target.value});
    }

    onChange(items) {
        this.setState({items});
        this.props.onChange({
            target: {
                name: 'config.navigations',
                value: items.map((item) => item.value) || []
            }
        });
    }

    render() {

        return (
            [
                <div className="form-row" key="select">
                    <SelectInput
                        key='navigation'
                        name='navigation'
                        label={gettext('Select Navigation')}
                        options={this.getNavigations()}
                        onChange={this.onSelect}
                        error={this.props.errors ? this.props.errors.navigations : null} />
                    <div className="form-group align-self-sm-end ml-3">
                        <button
                            type="button"
                            onClick={() => this.onAdd(this.state.selected)}
                            className="btn btn-lg btn-primary">{gettext('Add')}</button>
                    </div>
                </div>,
                <div className="form-row" key="sort">
                    <div className="form-row--navigation-card">
                        <SortItems items={this.state.items} onChange={this.onChange}/>
                    </div>
                </div>
            ]
        );


    }
}

ConfigNavigation.propTypes = {
    card: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    errors: PropTypes.object,
    navigations: PropTypes.arrayOf(PropTypes.object),
};

export default ConfigNavigation;