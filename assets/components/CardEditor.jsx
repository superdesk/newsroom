import React from 'react';
import PropTypes from 'prop-types';

import {gettext} from 'utils';

export default class CardEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = { open: this.props.forceEditor };

        this.onEditClick = this.onEditClick.bind(this);
        this.onCancelClick = this.onCancelClick.bind(this);
        this.onSave = this.onSave.bind(this);
    }

    componentWillReceiveProps(nextProps, nextState) {
        if (!nextState.open && nextProps.forceEditor) {
            this.setState({ open: true });
        }
    }

    onEditClick() {
        this.setState({ open: true });
        if (this.props.onEdit) {
            this.props.onEdit();
        }
    }

    onCancelClick() {
        this.setState({ open: false });
        if (this.props.onCancel) {
            this.props.onCancel();
        }
    }

    onSave(event) {
        this.props.onSave(event);
        this.setState({ open: false });
    }

    renderEditor() {
        const {
            editorTitle,
            saveText,
            hideCancel,
            label,
            editorClassNames,
            editorCardBody,
            errors
        } = this.props;

        return (
            <div className={`tab-pane active tab-pane--no-scroll ${editorClassNames}`} id='card-editor'>
                <form onSubmit={(event) => {event.preventDefault();}}>
                    <div className="list-item__preview-form list-item__preview-form--no-scroll pb-0 pt-0">
                        <div className="card mt-3 d-block">
                            <div className="card-header d-flex flex-row">{editorTitle || label}</div>
                            <div className="card-body">{editorCardBody}</div>
                            <div className="card-footer d-flex">
                                <button
                                    className="btn btn-outline-primary ml-auto"
                                    onClick={this.onSave}
                                    disabled={Object.keys(errors || {}).length > 0}
                                >
                                    {saveText}
                                </button>
                                {!hideCancel && (
                                    <button
                                        className='btn btn-outline-secondary ml-3'
                                        onClick={this.onCancelClick}
                                    >
                                        {gettext('Cancel')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        );
    }

    renderPreview() {
        const {
            previewTitle,
            titleClassNames,
            label,
            previewClassNames,
            previewCardBody,
            onDelete,
        } = this.props;

        return (
            <div className={`tab-pane active ${previewClassNames}`} id='card-preview'>
                <form onSubmit={(event) => {event.preventDefault();}}>
                    <div className="list-item__preview-form  pb-0 pt-0">
                        <div className="card mt-3 d-block">
                            <div className="card-header d-flex justify-content-start align-items-center">
                                <span className={titleClassNames}>{previewTitle || label}</span>
                                <button className="icon-button ml-auto" onClick={this.onEditClick}>
                                    <i className="icon--edit" />
                                </button>
                                {!this.props.noDelete && <button className="icon-button" onClick={onDelete}>
                                    <i className="icon--trash" />
                                </button>}
                            </div>
                            <div className="card-body">{previewCardBody}</div>
                        </div>
                    </div>
                </form>
            </div>
        );
    }

    render() {
        return this.state.open ? this.renderEditor() : this.renderPreview();
    }

}

CardEditor.propTypes = {
    onCardEdit: PropTypes.func,
    onCardPreview: PropTypes.func,
    onSave: PropTypes.func,
    onCancel: PropTypes.func,
    label: PropTypes.string,
    previewCardBody: PropTypes.node,
    editorCardBody: PropTypes.node,
    noDelete: PropTypes.bool,
    forceEditor: PropTypes.bool,
    onEdit: PropTypes.func,
    editorTitle: PropTypes.string,
    saveText: PropTypes.string,
    hideCancel: PropTypes.bool,
    editorClassNames: PropTypes.string,
    errors: PropTypes.object,
    previewTitle: PropTypes.string,
    titleClassNames: PropTypes.string,
    previewClassNames: PropTypes.string,
    onDelete: PropTypes.func,
};
