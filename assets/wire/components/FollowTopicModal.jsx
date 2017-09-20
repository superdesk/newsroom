import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'components/Modal';
import { connect } from 'react-redux';
import { gettext } from 'utils';
import { closeModal, submitFollowTopic } from 'wire/actions';

class FollowTopicModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            query: this.props.data.topic,
            label: this.props.data.topic,
            description: ''
        };

        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(event) {
        event.preventDefault();
        this.props.submit(this.state);
    }

    onChangeHandler(field) {
        return (event) => {
            this.setState({
                [field]: event.target.value,
            });
        };
    }

    render() {
        return (
            <Modal onClose={closeModal}>
                <button type="button"
                    className="close pull-right"
                    onClick={this.props.closeModal}>
                    <span>&times;</span>
                </button>
                <h1>{gettext('Follow topic')}</h1>
                <form onSubmit={this.onSubmit}>
                    <div className="form-group">
                        <label htmlFor="topicName">{gettext('Topic name')}</label>
                        <input type="text"
                            className="form-control"
                            id="topicName"
                            required="required"
                            value={this.state.label}
                            onChange={this.onChangeHandler('label')}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">{gettext('Description')}</label>
                        <textarea className="form-control"
                            id="description"
                            value={this.state.description}
                            onChange={this.onChangeHandler('description')}
                        />
                    </div>
                    <button type="button"
                        className="btn btn-outline-secondary"
                        onClick={this.props.closeModal}>
                        {gettext('Cancel')}
                    </button>
                    {' '}
                    <button type="submit"
                        className="btn btn-outline-primary">
                        {gettext('Save')}
                    </button>
                </form>
            </Modal>
        );
    }
}

FollowTopicModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    data: PropTypes.shape({
        topic: PropTypes.string.isRequired,
    }),
};

const mapDispatchToProps = (dispatch) => ({
    closeModal: () => dispatch(closeModal()),
    submit: (data) => dispatch(submitFollowTopic(data)),
});

export default connect(null, mapDispatchToProps)(FollowTopicModal);
