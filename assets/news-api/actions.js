import server from 'server';
import {cloneDeep} from 'lodash';

import {notify, gettext} from '../utils';

export function getTokenForCompany(companyId) {
    return server.get(`/news_api_tokens?company=${companyId}`);
}

export function generateTokenForCompany(token) {
    const newToken = cloneDeep(token);

    newToken.expiry = !token.expiry ? null : token.expiry;

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
        enabled: token.enabled,
        expiry: !token.expiry ? null : token.expiry,
    })
        .then(() => {
            notify.success(gettext('API Token updated successfully'));
        });
}
