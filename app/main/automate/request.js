const {uuid} = require("../common/common-utils");

class Request {
    id;
    command;
    timestamp;

    constructor() {
        this.id = uuid();
    }
}

module.exports = {
    Request
}
