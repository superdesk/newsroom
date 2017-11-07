import 'bootstrap';
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Primary modal button for actions like save/send/etc
 *
 * @param {string} label
 * @param {string} type
 * @param {func} onClick
 */
export function ModalPrimaryButton({label, type, onClick}) {
    assertButtonHandler(label, type, onClick);
    return (
        <button type={type || 'button'}
            onClick={onClick}
            className="btn btn-outline-primary"
        >{label}</button>
    );
}

ModalPrimaryButton.propTypes = {
    label: PropTypes.string.isRequired,
    type: PropTypes.string,
    onClick: PropTypes.func,
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
    componentDidMount() {
        $(this.elem).modal();
        $(this.elem).on('hidden.bs.modal', () => {
            this.props.onClose();
        });
    }

    componentWillUnmount() {
        $(this.elem).modal('hide'); // make sure it's gone
    }

    render() {
        return (
            <div className="modal mt-xl-5"
                ref={(elem) => this.elem = elem}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-body">
                            {this.props.children}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Modal.propTypes = {
    onClose: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
};

export default Modal;
