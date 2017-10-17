import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { gettext } from 'utils';
import { closeModal, submitDownloadItems } from 'wire/actions';

import Modal, { ModalPrimaryButton, ModalSecondaryButton } from 'components/Modal';
import CloseButton from 'components/CloseButton';
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
            <Modal onClose={closeModal}>
                <CloseButton onClick={this.props.closeModal} />
                <h1>{gettext('Download Items')}</h1>
                <form onSubmit={this.onSubmit}>
                    <SelectInput
                        name='format'
                        label={gettext('Format')}
                        required={true}
                        value={this.state.format}
                        onChange={this.onChange}
                        options={this.props.options}
                    />
                    <ModalSecondaryButton
                        onClick={this.props.closeModal}
                        label={gettext('Cancel')}
                    />
                    {' '}
                    <ModalPrimaryButton
                        type="submit"
                        label={gettext('Download')}
                    />
                </form>
            </Modal>
        );
    }
}

DownloadItemsModal.propTypes = {
    options: PropTypes.array.isRequired,
    closeModal: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    data: PropTypes.shape({
        items: PropTypes.arrayOf(PropTypes.string).isRequired,
    }),
};

const mapStateToProps = (state) => ({
    options: state.formats.map((format) => ({value: format.format, text: format.name})),
});

const mapDispatchToProps = (dispatch) => ({
    closeModal: () => dispatch(closeModal()),
    onSubmit: ({items, format}) => dispatch(submitDownloadItems(items, format)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DownloadItemsModal);
