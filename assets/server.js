class Server {
    get(url) {
        return fetch(url);
    }
}

export default new Server();
