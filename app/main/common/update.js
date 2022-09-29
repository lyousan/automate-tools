const axios = require('axios');
const path = require("path");
const fs = require("fs");
const latestApkUrl = 'https://gitee.com/lyousan/android-automate/releases/latest';

exports.latestApkInfo = async () => {
    return await new Promise((resovle, reject) => {
        axios.get(latestApkUrl, { headers: { 'X-Requested-with': 'XMLHttpRequest' } }).then(async res => {
            let version = res.data.release.tag.name.replace('v', '');
            let url = 'https://gitee.com' + res.data.release.release.attach_files[0].download_url;
            resovle({ version, url });
        }).catch(err => {
            console.log("获取最新apk版本失败:", err);
            resovle(err);
        })
    })
}

exports.download = async (url, filepath, name) => {
    if (!fs.existsSync(filepath)) {
        fs.mkdirSync(filepath);
    }
    const _path = path.resolve(filepath, name);
    const writer = fs.createWriteStream(_path);
    const response = await axios({
        url,
        method: "GET",
        responseType: "stream",
    });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
    });
}