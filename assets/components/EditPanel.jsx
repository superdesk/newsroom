import React from 'react';
import PropTypes from 'prop-types';
import {gettext} from '../utils';
import { isEmpty, get, pickBy, isEqual } from 'lodash';
import CheckboxInput from 'components/CheckboxInput';

class EditPanel extends React.Component {
    constructor(props) {
        super(props);
        this.onItemChange = this.onItemChange.bind(this);
        this.saveItems = this.saveItems.bind(this);
        this.initItems = this.initItems.bind(this);

        this.state = {activeParent: props.parent._id, items: {}};
    }

    onItemChange(event) {
        const item = event.target.name;
        const items = Object.assign({}, this.state.items);
        items[item] = !items[item];
        this.setState({items});
        if (this.props.onChange) {
            this.props.onChange({
                target: {
                    name: this.props.field,
                    value: Object.keys(items).filter((k) => items[k])
                }
            });
        }
    }

    saveItems(event) {
        event.preventDefault();
        this.props.onSave(Object.keys(pickBy(this.state.items)));
    }

    initItems(props) {
        const items = {};
        props.items.map((item) =>
            items[item._id] = (props.parent[props.field] || []).includes(item._id));

        this.setState({activeParent: props.parent._id, items});
    }

    componentWillMount() {
        this.initItems(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.activeParent !== nextProps.parent._id ||
            get(this.props, 'items.length', 0) !== get(nextProps, 'items.length', 0)) {
            this.initItems(nextProps);
            return;
        }

        let items = {};
        nextProps.items.map((item) =>
            items[item._id] = (nextProps.parent[nextProps.field] || []).includes(item._id));
        if (!isEqual(this.state.items, items)) {
            this.initItems(nextProps);
        }

    }

    renderList(items) {
        return (
            <ul className="list-unstyled">
                {items.map((item) => (
                    <li key={item._id}>
                        <CheckboxInput
                            name={item._id}
                            label={item.name}
                            value={!!this.state.items[item._id]}
                            onChange={this.onItemChange} />
                    </li>
                ))}
            </ul>
        );
    }

    render() {
        return (
            <div className='tab-pane active' id='navigations'>
                <form onSubmit={this.saveItems}>
                    <div className="list-item__preview-form">
                        {!isEmpty(this.props.groups) && this.props.groups.map((group) => (
                            <div className="form-group" key={group._id}>
                                <label>{group.name}</label>
                                {this.renderList(this.props.items.filter((item) => get(item, this.props.groupField, this.props.groupDefaultValue) === group._id))}
                            </div>
                        ))}
                        {isEmpty(this.props.groups) && this.renderList(this.props.items)}
                    </div>
                    <div className='list-item__preview-footer'>
                        {this.props.onCancel && (
                            <input
                                type="button"
                                className="btn btn-outline-secondary"
                                value={gettext('Cancel')}
                                onClick={this.props.onCancel}
                                disabled={this.props.cancelDisabled}
                            />
                        )}
                        <input
                            type='submit'
                            className='btn btn-outline-primary'
                            value={gettext('Save')}
                            disabled={this.props.saveDisabled}
                        />
                    </div>
                </form>
            </div>
        );
    }

}

EditPanel.propTypes = {
    parent: PropTypes.object.isRequired,
    items: PropTypes.arrayOf(PropTypes.object),
    field: PropTypes.string,
    onSave: PropTypes.func.isRequired,
    groups: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
    })),
    groupField: PropTypes.string,
    groupDefaultValue: PropTypes.string,
    onChange: PropTypes.func,
    cancelDisabled: PropTypes.bool,
    saveDisabled: PropTypes.bool,
    onCancel: PropTypes.func,
};

export default EditPanel;
