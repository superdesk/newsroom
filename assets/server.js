const defaultOptions = {
    credentials: 'same-origin',
    redirect: 'manual',
};

function options(custom={}) {
    return Object.assign({}, defaultOptions, custom);
}

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response.json();
    } else {
        if (response.type === 'opaqueredirect') {
            window.location.reload();
        } else {
            var error = new Error(response.statusText);
            error.response = response;
            throw error;
        }
    }
}


class Server {
    /**
     * Make GET request
     *
     * @param {String} url
     * @return {Promise}
     */

    getCsrfToken() {
        return this.get('/companies/get-csrf-token')
            .then(response => response.csrf_token);
    }

    get(url) {
        return fetch(url, options({}))
            .then(checkStatus);
    }

    /**
     * Make GET request accepting application/json
     *
     * @param {String} url
     * @return {Promise}
     */
    getJson(url) {
        return fetch(url, options({
            headers: {
                Accept: 'application/json',
            },
        })).then(checkStatus);
    }

    /**
     * Make POST request to url
     *
     * @param {String} url
     * @param {Object} data
     * @return {Promise}
     */
    post(url, data) {
        return fetch(url, options({
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
        })).then(checkStatus);
    }

    postWithCsrfToken(url, data) {
        return this.getCsrfToken().then(csrfToken => {
            return fetch(url, options({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify(data),
            })).then(checkStatus);
        });
    }

    /**
     * Make POST request to url in keeps the format of the input
     *
     * @param {String} url
     * @param {Object} data
     * @return {Promise}
     */
    postFiles(url, data) {
        return fetch(url, options({
            method: 'POST',
            body: data,
        })).then(checkStatus);
    }

    /**
     * Make DELETE request to url
     *
     * @param {String} url
     * @return {Promise}
     */
    del(url, data) {
        return fetch(url, options({
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: data ? JSON.stringify(data) : null,
        })).then(checkStatus);
    }

    /**
     * Make PATCH request to url
     *
     * @param {String} url
     * @param {Object} data
     * @return {Promise}
     */
    patch(url, data) {
        return fetch(url, options({
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
        })).then(checkStatus);
    }
}

export default new Server();
