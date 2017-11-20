import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { gettext } from 'utils';
import { submitDownloadItems } from 'wire/actions';

import Modal from 'components/Modal';
import SelectInput from 'components/SelectInput';

class DownloadItemsModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: props.data.items,
            format: 'text',
        };

        this.onSubmit = this.onSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
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
            <Modal onSubmit={this.onSubmit} title={gettext('Download Items')} onSubmitLabel={gettext('Download')}>
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
    data: PropTypes.shape({
        items: PropTypes.arrayOf(PropTypes.string).isRequired,
    }),
};

const mapStateToProps = (state) => ({
    options: state.formats.map((format) => ({value: format.format, text: format.name})),
});

const mapDispatchToProps = (dispatch) => ({
    onSubmit: ({items, format}) => dispatch(submitDownloadItems(items, format)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DownloadItemsModal);
