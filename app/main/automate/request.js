const {uuid} = require("../common/common-utils");

class Request {
    id;
    command;
    timestamp;

    constructor() {
        this.id = uuid();
        this.timestamp=new Date().getTime();
    }
}

module.exports = {
    Request
}
