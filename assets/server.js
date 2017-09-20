import fetch from 'isomorphic-fetch';

class Server {
    get(url) {
        return fetch(url);
    }
}

export default new Server();
