const { Request } = require("./request");
const { Command } = require("./command");

class Actions {
    constructor() {
    }

    click = async (client, cacheId) => {
        let request = new Request();
        request.command = new Command("NodeActions", "click", ["java.lang.String"], [cacheId]);
        let res = await new Promise((resolve, reject) => {
            client.send(request, (response) => {
                resolve(response);
            });
        })
        return res;
    }

    input = async (client, { cacheId, text }) => {
        let request = new Request();
        request.command = new Command("NodeActions", "input", ["java.lang.String", "java.lang.String"], [cacheId, text]);
        let res = await new Promise((resolve, reject) => {
            client.send(request, (response) => {
                resolve(response);
            });
        })
        return res;
    }
}

module.exports = {
    Actions
}
