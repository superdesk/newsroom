import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { gettext } from 'utils';
import { submitDownloadItems } from 'wire/actions';
import { modalFormValid } from 'actions';
import { context, modalOptions, modalSecondaryFormatOptions } from '../../selectors';
import { get } from 'lodash';

import Modal from 'components/Modal';
import SelectInput from 'components/SelectInput';

class DownloadItemsModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: props.data.items,
            params: {
                format: props.context === 'monitoring' ? 'monitoring_pdf' : 'text',
                secondaryFormat: get(props, 'secondaryOptions.length', 0) ? props.secondaryOptions[0].value : null
            }
        };

        this.onSubmit = this.onSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    componentWillMount() {
        // Because 'text' is alredy selected, the form is valid.
        this.props.modalFormValid();
    }

    onChange(field, event) {
        this.setState({
            ...this.state,
            params: {
                ...this.state.params,
                [field]: event.target.value,
            }
        });
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
                        value={this.state.params.format}
                        onChange={this.onChange.bind(null, 'format')}
                        options={this.props.options}
                    />
                    {get(this.props, 'secondaryOptions.length', 0) > 0 && <SelectInput
                        name='format'
                        label={gettext('Format')}
                        value={this.state.params.secondaryFormat}
                        onChange={this.onChange.bind(null, 'secondaryFormat')}
                        options={this.props.secondaryOptions}
                    />}
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
    secondaryOptions: PropTypes.array,
};

const mapStateToProps = (state, props) => ({
    options: modalOptions(state, props),
    context: context(state),
    secondaryOptions: modalSecondaryFormatOptions(state),
});

const mapDispatchToProps = (dispatch) => ({
    onSubmit: ({items, params}) => dispatch(submitDownloadItems(items, params)),
    modalFormValid: () => dispatch(modalFormValid()),
});

export default connect(mapStateToProps, mapDispatchToProps)(DownloadItemsModal);
