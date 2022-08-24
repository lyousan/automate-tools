const { ipcMain } = require("electron");
const { loadDoc, getOriginXml } = require("../common/layout-util");
const { setClipboard } = require("../common/clipboard");
const { adbDevices, screenCap, getAppVersion, installApp } = require("../common/adb-utils");
const { Dump } = require("../automate/dump");
const { AndroidBot } = require("../automate/androidBot");
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
    ipcMain.handle('screenCap', (event, { udid, filename = 'layout.png' }) => {
        return screenCap(udid, filename);
    });
    ipcMain.handle('check-automate', (event, { udid }) => {
        let version = getAppVersion(udid, 'cn.chci.hmcs.automate');
        if (!version) {
            installApp(udid, path.join(process.cwd(), 'resources/automate.apk'));
        }
        return version;
    });
    let bot = null;
    ipcMain.on('automate-create', (event, { udid }) => {
        bot = new AndroidBot(udid);
    });
    ipcMain.handle('automate-dump', async (event, { filename = 'layout.xml' }) => {
        const removeBefore = () => {
            let dir = path.resolve(process.cwd(), 'resources');
            let files = fs.readdirSync(dir);
            files.forEach(file => {
                if (file.startsWith('layout')) {
                    fs.unlinkSync(path.resolve(dir, file));
                }
            })
        }
        // 删除之前的文件
        removeBefore();
        let dumpRes = await bot.dump();
        let filepath = path.resolve(process.cwd(), `resources/${filename}`);
        if (dumpRes.code == 200) {
            fs.writeFileSync(filepath, dumpRes.data);
        }
        return new Response(dumpRes.code, dumpRes.msg, filepath);
    });
    ipcMain.handle('automate-node-click', async (event, cacheId) => {
        return await bot.nodeClick(cacheId);
    });
    ipcMain.handle('automate-find', async (event, { type, value }) => {
        let res = await bot.find({ type, value });
        return res
    });
    ipcMain.handle('automate-input', async (event, { cacheId, text }) => {
        let res = await bot.input({ cacheId, text });
        return res
    });
    ipcMain.handle('automate-global-click', async (event, { x, y }) => {
        let res = await bot.globalClick({ x, y });
        return res
    });
    ipcMain.handle('automate-global-back', async (event) => {
        let res = await bot.globalBack();
        return res
    });
    ipcMain.handle('automate-global-home', async (event) => {
        let res = await bot.globalHome();
        return res
    });
    ipcMain.handle('automate-global-recents', async (event) => {
        let res = await bot.globalRecents();
        return res
    })
};
