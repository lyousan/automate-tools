const {Request} = require("./request");
const {Command} = require("./command");

class Dump {
    constructor() {
    }

    dump = async (client) => {
        let request = new Request();
        request.command = new Command("Dump", "dump", [], []);
        let res = await new Promise((resolve, reject) => {
            client.send(request, (response) => {
                resolve(response);
            });
        })
        return res;
    }
}

module.exports = {Dump}
