const {ipcMain} = require("electron");
const {loadDoc, getOriginXml} = require("../common/layout-util");
const {setClipboard} = require("../common/clipboard");
const {adbDevices, screenCap} = require("../common/adb-utils");
const {Dump} = require("../automate/dump");
const {AndroidBot} = require("../automate/androidBot");
const fs = require("fs");
const path = require("path");

class Response {
    code;
    msg;
    data;

    constructor(code, msg, data) {
        this.code = code;
        this.msg = msg;
        this.data = data;
    }
}

module.exports = function () {
    ipcMain.handle("loadDoc", (event, filepath) => {
        let result = loadDoc(filepath);
        // console.log("loadDoc: ", result);
        return result;
    });
    ipcMain.on("setClipboard", (event, text) => {
        setClipboard(text);
    });
    ipcMain.handle('loadDevices', () => {
        return adbDevices();
    });
    ipcMain.handle('getOriginXml', (event) => {
        return getOriginXml();
    });
    ipcMain.handle('screenCap', (event, {udid, filename = 'layout.png'}) => {
        return screenCap(udid, filename);
    });
    let bot = null;
    ipcMain.on('automate-create', (event, {udid}) => {
        bot = new AndroidBot(udid);
    });
    ipcMain.handle('automate-dump', async (event, {filename = 'layout.xml'}) => {
        let dumpRes = await bot.dump();
        let filepath = path.resolve(process.cwd(), `resources/${filename}`);
        if (dumpRes.code == 200) {
            fs.writeFileSync(filepath, dumpRes.data);
        }
        return new Response(dumpRes.code, dumpRes.msg, filepath);
    });
    ipcMain.handle('automate-node-click', async (event, cacheId) => {
        return await bot.nodeClick(cacheId);
    })
};
