const defaultOptions = {
    credentials: 'same-origin',
};

function options(custom={}) {
    return Object.assign({}, defaultOptions, custom);
}

class Server {
    /**
     * Make GET request
     *
     * @param {String} url
     * @return {Promise}
     */
    get(url) {
        return fetch(url, options({}));
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
        }));
    }
}

export default new Server();
