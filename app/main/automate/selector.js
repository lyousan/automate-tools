const { Request } = require("./request");
const { Command } = require("./command");

class Selector {
    constructor() { }

    findOne = async (client, { type, value }) => {
        let xpath = ''
        if (type === 'id') {
            xpath = `//*[@resource-id="${value}"]`
        } else if (type === 'content-desc') {
            xpath = `//*[@content-desc="${value}"]`
        } else if (type === 'xpath') {
            xpath = value
        }
        let request = new Request()
        request.command = new Command("Selector", "findOne", ['cn.chci.hmcs.automate.accessibility.fn.By', 'java.lang.Boolean'], [{ xpath }, false])
        let res = await new Promise((resolve, reject) => {
            client.send(request, (resposne => {
                resolve(resposne)
            }));
        })
        return res
    }

    find = async (client, { type, value }) => {
        let xpath = ''
        if (type === 'id') {
            xpath = `//*[@resource-id="${value}"]`
        } else if (type === 'content-desc') {
            xpath = `//*[@content-desc="${value}"]`
        } else if (type === 'xpath') {
            xpath = value
        }
        let request = new Request()
        request.command = new Command("Selector", "find", ['cn.chci.hmcs.automate.accessibility.fn.By', 'java.lang.Boolean'], [{ xpath }, false])
        let res = await new Promise((resolve, reject) => {
            client.send(request, (resposne => {
                resolve(resposne)
            }));
        })
        return res
    }
}

module.exports = {
    Selector
}