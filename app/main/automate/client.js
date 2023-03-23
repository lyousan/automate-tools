const net = require("net");
const { grantSecurePermission, portForward, startAutomate, backByAdb } = require("../common/adb-utils");
const pako = require('pako');

class Client {
    __udid = '';
    __socket = null;
    __requestMap = new Map();

    constructor() {
    }

    connect = (udid, port, host) => {
        return new Promise((resolve, reject) => {
            this.__udid = udid;
            grantSecurePermission(udid);
            portForward(udid, port);
            startAutomate(udid);
            // backByAdb(udid);
            this.__socket = net.createConnection(port, host);
            this.__socket.on('connect', () => {
                console.log('connected');
                resolve(this);
            })
            let len = 0;
            let compressedData = Buffer.alloc(0);
            let internalData = Buffer.alloc(0);
            this.__socket.on('data', (data) => {
                /* console.log(data)
                let temLen = Number.parseInt(data.slice(0, 8).toString());
                if (temLen > 0) {
                    len = temLen;
                    let tmp = Buffer.alloc(data.length - 8);
                    compressedData.copy(tmp);
                    data.copy(tmp, compressedData.length, 8);
                    compressedData = tmp;
                } else {
                    let tmp = Buffer.alloc(compressedData.length + data.length);
                    compressedData.copy(tmp);
                    data.copy(tmp, compressedData.length, 0);
                    compressedData = tmp;
                }
                // console.log('compressedData: ', compressedData);
                if (compressedData.length === len) {
                    let plain = pako.inflate(compressedData, { to: 'string' });
                    // 处理好的响应
                    console.log(`response:${plain}`);
                    let response = JSON.parse(plain);
                    this.__requestMap.get(response.requestId)(response);
                    compressedData = Buffer.alloc(0);
                    len = 0;
                } else if (compressedData.length > len) {
                    console.log('error:请不要发送的过快');
                    compressedData = Buffer.alloc(0);
                    len = 0;
                } */
                internalData = data;
                console.log(internalData);
                while (internalData.length >= 0) {
                    let temLen = Number.parseInt(internalData.slice(0, 8).toString());
                    if (temLen > 0) {
                        len = temLen;
                        compressedData = Buffer.alloc(internalData.length - 8);
                        internalData.copy(compressedData, 0, 8);
                    } else {
                        let tmp = Buffer.alloc(compressedData.length + internalData.length);
                        compressedData.copy(tmp);
                        internalData.copy(tmp, compressedData.length, 0);
                        compressedData = tmp;
                    }
                    if (compressedData.length === len) {
                        let plain = pako.inflate(compressedData, { to: 'string' });
                        // 处理好的响应
                        console.log(`response:${plain}`);
                        let response = JSON.parse(plain);
                        this.__requestMap.get(response.requestId)(response);
                        compressedData = Buffer.alloc(0);
                        internalData = Buffer.alloc(0);
                        len = 0;
                        break;
                    } else if (compressedData.length > len) {
                        let fullData = Buffer.alloc(len);
                        compressedData.copy(fullData, 0, 0, len);
                        let plain = pako.inflate(compressedData, { to: 'string' });
                        // 处理好的响应
                        console.log(`response:${plain}`);
                        let response = JSON.parse(plain);
                        this.__requestMap.get(response.requestId)(response);
                        console.error('数据被合并');
                        internalData = Buffer.alloc(compressedData.length - len);
                        compressedData.copy(internalData, 0, len);
                        compressedData = Buffer.alloc(0);
                    } else {
                        break;
                    }
                }
            })

            this.__socket.on('drain', () => {
                console.log('drain')
            });

            this.__socket.on('end', () => {
                console.log('end');
            });

            this.__socket.on('error', (err) => {
                console.log('error', err);
                reject(err);
            });

            this.__socket.on('lookup', (err, address, family, host) => {
                console.log('lookup', err, address, family, host)
            });

            this.__socket.on('timeout', () => {
                console.log('timeout')
            });
        })
    };
    send = (request, callback) => {
        console.log(request)
        this.__requestMap.set(request.id, callback);
        this.__socket.write(JSON.stringify(request) + '\n');
    };
}


module.exports = {
    Client
}
