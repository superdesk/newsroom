import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { gettext } from 'utils';
import { submitDownloadItems } from 'wire/actions';
import { modalFormValid } from 'actions';
import { context } from '../../selectors';
import { get } from 'lodash';

import Modal from 'components/Modal';
import SelectInput from 'components/SelectInput';

class DownloadItemsModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: props.data.items,
            format: props.context === 'watch_lists' ? 'watch_lists' : 'text',
        };

        this.onSubmit = this.onSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    componentWillMount() {
        // Because 'text' is alredy selected, the form is valid.
        this.props.modalFormValid();
    }

    onChange(event) {
        this.setState({format: event.target.value});
    }

    onSubmit(event) {
        event.preventDefault();
        this.props.onSubmit(this.state);
    }

    render() {
        return (
            <Modal
                onSubmit={this.onSubmit}
                title={gettext('Download Items')}
                onSubmitLabel={gettext('Download')}
                disableButtonOnSubmit >
                <form onSubmit={this.onSubmit}>
                    <SelectInput
                        name='format'
                        label={gettext('Format')}
                        required={true}
                        value={this.state.format}
                        onChange={this.onChange}
                        options={this.props.options}
                    />
                </form>
            </Modal>
        );
    }
}

DownloadItemsModal.propTypes = {
    options: PropTypes.array.isRequired,
    onSubmit: PropTypes.func.isRequired,
    modalFormValid: PropTypes.bool,
    data: PropTypes.shape({
        items: PropTypes.arrayOf(PropTypes.string).isRequired,
    }),
    context: PropTypes.string,
};

const mapOptions = (state, props) => {
    let options = state.formats;
    if (props.data.items && props.data.items.length) {
        const itemType = state.format === 'agenda' ? 'agenda' : 'wire';
        options = options.filter((opt) => get(opt, 'types', ['wire', 'agenda']).includes(itemType));
    }

    return options.map((format) => ({value: format.format, text: format.name}));
};

const mapStateToProps = (state, props) => ({
    options: mapOptions(state, props),
    context: context(state),
});

const mapDispatchToProps = (dispatch) => ({
    onSubmit: ({items, format}) => dispatch(submitDownloadItems(items, format)),
    modalFormValid: () => dispatch(modalFormValid()),
});

export default connect(mapStateToProps, mapDispatchToProps)(DownloadItemsModal);
