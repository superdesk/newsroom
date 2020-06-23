import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {get, isEqual} from 'lodash';
import {gettext} from '../../utils';

import EditAPIToken from 'news-api/components/EditAPIToken';
import TextListInput from 'components/TextListInput';
import CardEditor from 'components/CardEditor';


export default class EditCompanyAPI extends React.Component {
    constructor(props) {
        super(props);
        this.onIpWhitelistChange = this.onIpWhitelistChange.bind(this);
        this.onCardEdit = this.onCardEdit.bind(this);
        this.onCardPreview = this.onCardPreview.bind(this);
        this.onSaveIpList = this.onSaveIpList.bind(this);

        this.state = { noListInput: true };
    }

    componentWillReceiveProps(nextProps) {
        if (!isEqual(get(this.props, 'company.allowed_ip_list'), get(nextProps, 'company.allowed_ip_list'))) {
            this.setState({ noListInput: true });
        }

        if (get(nextProps, 'errors.allowed_ip_list')) {
            this.setState({ noListInput: false });   
        }
    }

    onIpWhitelistChange(event) {
        this.props.onEditCompany({
            target: {
                name: 'allowed_ip_list',
                value: event.target.value,
            }
        });
    }

    onCardEdit() {
        this.setState({ noListInput: false });
    }

    onCardPreview() {
        if (!this.state.noListInput) {
            this.setState({ noListInput: true });
        }

        // Reset to original values if errors are present
        if (get(this.props, 'errors.allowed_ip_list')) {
            this.props.onEditCompany({
                target: {
                    name: 'allowed_ip_list',
                    value: get(this.props.originalItem, 'allowed_ip_list', []),
                }
            });
        }
    }

    onSaveIpList() {
        this.props.onSave();
        this.setState({ noListInput: true });
    }

    renderIPWhiteList() {
        const cardBody = (<TextListInput
            name='allowed_ip_list'
            value={this.props.company.allowed_ip_list || []}
            onChange={this.onIpWhitelistChange}
            readOnly={this.state.noListInput}
            error={this.props.errors ? this.props.errors.allowed_ip_list.join(', ') : null} />);

        return(
            <CardEditor
                label={gettext('Allowed IP Addresses')}
                noDelete
                previewCardBody={cardBody}
                editorCardBody={cardBody}
                onSave={this.onSaveIpList}
                onCancel={this.onCardPreview}
                onEdit={this.onCardEdit}
                editorClassNames='company-api__token-edit'
                previewClassNames='company-api__token-preview'
                saveText={gettext('Save')}
                forceEditor={get(this.props, 'errors.allowed_ip_list')} />
        );
    }
    
    render() {
        return (
            <Fragment>
                <EditAPIToken companyId={this.props.company._id} />
                {this.renderIPWhiteList()}
            </Fragment>
        );
    }
}

EditCompanyAPI.propTypes = {
    company: PropTypes.object,
    onEditCompany: PropTypes.func,
    onSave: PropTypes.func,
    errors: PropTypes.object,
    originalItem: PropTypes.object,
};
