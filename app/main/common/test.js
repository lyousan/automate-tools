const {client} = require("../automate/client");
const {adbDevices} = require("./adb-utils");
const {Dump} = require("../automate/dump");
const fs = require("fs");
const path = require("path");

async function main() {
    let udid = adbDevices()[0];
    let __client = new client();
    await __client.connect(udid, 33579, '127.0.0.1');
    let dumpRes = await new Dump().dump(__client);
    console.log(dumpRes);
}

// main();

let dir = path.resolve(__dirname, `../../../resource`);
let files = fs.readdirSync(dir);
files.forEach(file => {
    if (file.startsWith('layout')) {
        fs.unlink(path.resolve(dir, file), () => {
        });
    }
})
