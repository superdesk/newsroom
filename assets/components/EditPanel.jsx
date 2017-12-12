import React from 'react';
import PropTypes from 'prop-types';
import {gettext} from '../utils';
import { pickBy } from 'lodash';
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
        if (this.state.activeParent !== nextProps.parent._id) {
            this.initItems(nextProps);
        }
    }

    render() {
        return (
            <div className='tab-pane active' id='navigations'>
                <form onSubmit={this.saveItems}>
                    <div className="list-item__preview-form">
                        <ul className="list-unstyled">
                            {this.props.items.map((item) => (
                                <li key={item._id}>
                                    <CheckboxInput
                                        name={item._id}
                                        label={item.name}
                                        value={!!this.state.items[item._id]}
                                        onChange={this.onItemChange} />
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className='list-item__preview-footer'>
                        <input
                            type='submit'
                            className='btn btn-outline-primary'
                            value={gettext('Save')}
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
};

export default EditPanel;
