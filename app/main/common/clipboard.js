const {clipboard} = require("electron");

exports.setClipboard = (text) => {
    clipboard.writeText(text);
}
