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

    swipe = async (client, points) => {
        let request = new Request();
        request.command = new Command("Global", "swipe", ["cn.chci.hmcs.automate.model.Point", "cn.chci.hmcs.automate.model.Point", "java.lang.Integer"], [points[0], points[1], 500]);
        let res = await new Promise((resolve, reject) => {
            client.send(request, (response) => {
                resolve(response);
            });
        })
        return res;
    }

    back = async (client) => {
        let request = new Request();
        request.command = new Command("Global", "back", [], []);
        let res = await new Promise((resolve, reject) => {
            client.send(request, (response) => {
                resolve(response);
            });
        })
        return res;
    }

    home = async (client) => {
        let request = new Request();
        request.command = new Command("Global", "home", [], []);
        let res = await new Promise((resolve, reject) => {
            client.send(request, (response) => {
                resolve(response);
            });
        })
        return res;
    }

    recents = async (client) => {
        let request = new Request();
        request.command = new Command("Global", "recents", [], []);
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