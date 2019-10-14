import 'bootstrap';
import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { gettext } from 'utils';
import { connect } from 'react-redux';
import { closeModal } from 'actions';

import CloseButton from './CloseButton';

/**
 * Primary modal button for actions like save/send/etc
 *
 * @param {string} label
 * @param {string} type
 * @param {func} onClick
 */
export function ModalPrimaryButton({label, type, onClick, disabled}) {
    assertButtonHandler(label, type, onClick);
    return (
        <button type={type || 'button'}
            onClick={onClick}
            className="btn btn-outline-primary"
            disabled={disabled}
        >{label}</button>
    );
}

ModalPrimaryButton.propTypes = {
    label: PropTypes.string.isRequired,
    type: PropTypes.string,
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
};

/**
 * Secondary modal button for actions like cancel/reset
 *
 * @param {string} label
 * @param {string} type
 * @param {func} onClick
 */
export function ModalSecondaryButton({label, type, onClick}) {
    assertButtonHandler(label, type, onClick);
    return (
        <button type={type || 'button'}
            onClick={onClick}
            className="btn btn-outline-secondary"
        >{label}</button>
    );
}

ModalSecondaryButton.propTypes = {
    'label': PropTypes.string.isRequired,
    onClick: PropTypes.func,
    type: PropTypes.string,
};

/**
 * Test if button makes any sense
 *
 * either type or onClick handler must be specified
 *
 * @param {string} label
 * @param {string} type
 * @param {func} onClick
 */
function assertButtonHandler(label, type, onClick) {
    if (!type && !onClick) {
        console.warn('You should use either type or onClick handler for button', label);
    }
}

class Modal extends React.Component {
    constructor(props) {
        super(props);
        this.onSubmit = this.onSubmit.bind(this);
        this.state = { submitting: false };
    }

    componentDidMount() {
        const options = {};

        if (!this.props.clickOutsideToClose) {
            options.backdrop = 'static';
        }

        $(this.elem).modal(options);
        $(this.elem).on('hidden.bs.modal', () => {
            this.props.closeModal();
        });
    }

    componentWillUnmount() {
        $(this.elem).modal('hide'); // make sure it's gone
    }

    onSubmit(e) {
        if (this.props.disableButtonOnSubmit) {
            this.setState({ submitting: true });
            this.props.onSubmit(e);
            return;
        }

        this.props.onSubmit(e);
    }

    render() {
        return (
            <div className="modal mt-xl-5"
                ref={(elem) => this.elem = elem}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{this.props.title}</h5>
                            <CloseButton onClick={this.props.closeModal} />
                        </div>
                        <div className="modal-body">
                            {this.props.children}
                        </div>
                        <div className="modal-footer">
                            <ModalSecondaryButton
                                type="reset"
                                label={this.props.onCancelLabel}
                                onClick={this.props.closeModal}
                            />
                            {' '}
                            <ModalPrimaryButton
                                type="submit"
                                label={this.props.onSubmitLabel}
                                onClick={this.onSubmit}
                                disabled={this.state.submitting || !this.props.formValid}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Modal.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onSubmitLabel: PropTypes.string,
    onCancelLabel: PropTypes.string,
    closeModal: PropTypes.func.isRequired,
    disableButtonOnSubmit: PropTypes.bool,
    formValid: PropTypes.bool,
    clickOutsideToClose: PropTypes.bool,
};

Modal.defaultProps = {
    onSubmitLabel: gettext('Save'),
    onCancelLabel: gettext('Cancel'),
    clickOutsideToClose: false,
};

const mapStateToProps = (state) => ({ formValid: get(state, 'modal.formValid') });

export default connect(mapStateToProps, {closeModal})(Modal);
