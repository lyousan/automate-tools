// const { default: installExtension, VUEJS3_DEVTOOLS } = require('electron-devtools-installer');

const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const ipcMainHandler = require('./ipc/ipcMainHandler');
let mainWin;
const createMainWindow = () => {
    // Menu.setApplicationMenu(null);
    mainWin = new BrowserWindow({
        width: 1920,
        height: 1080,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,   //允许渲染进程使用node.js
            contextIsolation: false,  //允许渲染进程使用node.js
            webSecurity: false,
        }
    })
    if (isDev) {
        mainWin.loadURL('http://127.0.0.1:5173');
        // mainWin.webContents.openDevTools();
    } else {    
        mainWin.loadFile(path.resolve(__dirname, '../renderer/pages/index.html'));
    }
    console.log("process.cwd(): ", process.cwd());
    console.log(path.resolve(process.cwd(), 'resource'));
}
/* app.whenReady().then(() => {
    // installExtension(VUEJS3_DEVTOOLS)
    // .then((name) => console.log(`Added Extension:  ${name}`))
    // .catch((err) => console.log('An error occurred: ', err));
    createMainWindow();
    // ipcMainHandler();
}) */
app.on('ready', () => {
    createMainWindow();
    ipcMainHandler();
})