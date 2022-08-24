const { Request } = require("./request");
const { Command } = require("./command");

class Global {
    constructor() {
        
    }

    click = async (client, { x, y }) => {
        let request = new Request();
        request.command = new Command("Global", "click", ["cn.chci.hmcs.automate.model.Point"], [{ x, y }]);
        let res = await new Promise((resolve, reject) => {
            client.send(request, (response) => {
                resolve(response);
            });
        })
        return res;
    }
}

module.exports = {
    Global
}