import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {get, isEqual} from 'lodash';
import {gettext} from '../../utils';

import EditAPIToken from 'news-api/components/EditAPIToken';
import TextListInput from 'components/TextListInput';


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
    }

    onSaveIpList() {
        this.props.onSave();
        this.setState({ noListInput: true });
    }
    
    render() {
        const cardBody = (<TextListInput
            name='allowed_ip_list'
            value={this.props.company.allowed_ip_list || []}
            onChange={this.onIpWhitelistChange}
            readOnly={this.state.noListInput}
            error={this.props.errors ? this.props.errors.allowed_ip_list.join(', ') : null} />);

        return (
            <Fragment>
                <EditAPIToken companyId={this.props.company._id} />
                <EditAPIToken
                    label={gettext('Allowed IP Addresses')}
                    disableToken
                    noDelete
                    previewCardBody={cardBody}
                    editorCardBody={cardBody}
                    onSave={this.onSaveIpList}
                    onCardEdit={this.onCardEdit}
                    onCardPreview={this.onCardPreview}  />
            </Fragment>
        );
    }
}

EditCompanyAPI.propTypes = {
    company: PropTypes.object,
    onEditCompany: PropTypes.func,
    onSave: PropTypes.func,
    errors: PropTypes.object,
};
