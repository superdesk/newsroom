import server from 'server';
import moment from 'moment';
import {cloneDeep} from 'lodash';

import {notify, gettext} from '../utils';

export function getTokenForCompany(companyId) {
    return server.get(`/news_api_tokens?company=${companyId}`);
}

export function generateTokenForCompany(token) {
    const newToken = cloneDeep(token);
    newToken.expiry = moment(token.expiry).format('YYYY-MM-DDTHH:MM:SS+0000');

    return server.post('/news_api_tokens', newToken)
        .then((data) => {
            notify.success(gettext('API Token generated successfully'));
            return data.token;
        });
}

export function deleteTokenForCompany(companyId) {
    return server.del(`/news_api_tokens?company=${companyId}`)
        .then(() => {
            notify.success(gettext('API Token deleted successfully'));
        });
}

export function updateTokenForCompany(token) {
    const tokenId = encodeURIComponent(token.token);

    return server.patch(`/news_api_tokens?token=${tokenId}`, {
        expiry: token.expiry,
        enabled: token.enabled,
    })
        .then(() => {
            notify.success(gettext('API Token updated successfully'));
        });
}
