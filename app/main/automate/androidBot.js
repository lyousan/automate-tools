const { Actions } = require("./actions");
const { Dump } = require("./dump");
const { Client } = require("./client");
const { Selector } = require("./selector");
const { Global } = require("./global");

class AndroidBot {
    __udid = '';
    __client = new Client();
    __dump = new Dump();
    __actions = new Actions();
    __selector = new Selector();
    __global = new Global();
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

    input = async (options) => {
        return await this.__actions.input(this.__client, options);
    }

    findOne = async (options) => {
        return await this.__selector.findOne(this.__client, options);
    }

    find = async (options) => {
        return await this.__selector.find(this.__client, options);
    }

    globalClick = async (options) => {
        return await this.__global.click(this.__client, options);
    }
    globalBack = async () => {
        return await this.__global.back(this.__client);
    }
    globalHome = async () => {
        return await this.__global.home(this.__client);
    }
    globalRecents = async () => {
        return await this.__global.recents(this.__client);
    }
}

module.exports = {
    AndroidBot
}
