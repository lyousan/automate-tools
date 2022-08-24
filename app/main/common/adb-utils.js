const { execSync } = require('child_process');
const path = require("path");
const fs = require("fs");
const ADB_DEVICES = 'adb devices';
const PACKAGE_NAME = 'cn.chci.hmcs.automate';
exports.adbDevices = () => {
    let res = execSync(ADB_DEVICES).toString()
        .split('\r\n')
        .filter(line => line.indexOf('\tdevice') > -1)
        .map(udid => udid.replace('\tdevice', ''));
    return res;
}
exports.grantSecurePermission = (udid) => {
    execSync(`adb -s ${udid} shell pm grant ${PACKAGE_NAME} android.permission.WRITE_SECURE_SETTINGS`);
};
exports.portForward = (udid, localPort) => {
    execSync(`adb -s ${udid} forward tcp:${localPort} tcp:33579`);
};
exports.startAutomate = (udid) => {
    execSync(`adb -s ${udid} shell am start ${PACKAGE_NAME}/.MainActivity`);
};
exports.backByAdb = (udid) => {
    execSync(`adb -s ${udid} shell input keyevent 4`);
};
exports.screenCap = (udid, filename) => {
    let filepath = path.resolve(process.cwd(), `resources/${filename}`);
    execSync(`adb -s ${udid} shell screencap -p /sdcard/${filename}`);
    execSync(`adb -s ${udid} pull /sdcard/${filename} "${filepath}"`);
    return filepath;
}
exports.getAppVersion = (udid, packageName) => {
    try {
        let version = execSync(`adb -s ${udid} shell pm dump ${packageName} | findstr versionName`);
        return version && version.toString().replace('versionName=', '').trim();
    } catch (err) {
        console.error(err);
    }
}
exports.installApp = (udid, apkPath) => {
    execSync(`adb -s ${udid} install -r "${apkPath}"`);
}
