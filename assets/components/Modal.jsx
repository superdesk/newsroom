import 'bootstrap';
import React from 'react';
import PropTypes from 'prop-types';


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
            <div className="modal"
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
