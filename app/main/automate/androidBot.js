const {Actions} = require("./actions");
const {Dump} = require("./dump");
const {Client} = require("./client");

class AndroidBot {
    __udid = '';
    __client = new Client();
    __dump = new Dump();
    __actions = new Actions();

    constructor(udid) {
        this.__udid = udid;
        this.__client.connect(udid, 33579, '127.0.0.1');
    }

    dump = async () => {
        return await this.__dump.dump(this.__client);
    }

    nodeClick = async (cacheId) => {
        return await this.__actions.click(this.__client, cacheId);
    }
}

module.exports = {
    AndroidBot
}
