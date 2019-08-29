import React from 'react';
import PropTypes from 'prop-types';

import EditAPIToken from 'news-api/components/EditAPIToken';


export default class EditCompanyAPI extends React.PureComponent {
    render() {
        return ([
            <EditAPIToken companyId={this.props.companyId} key="edit-api-token" />
        ]);
    }
}

EditCompanyAPI.propTypes = {companyId: PropTypes.string};
