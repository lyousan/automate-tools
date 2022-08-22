const net = require('net');

const socket = net.createConnection(10000, 'localhost')

socket.on('close', (had_error) => {
    console.log('had_error', had_error)
});

socket.on('connect', () => {
    console.log('connect')
    socket.write('2021-01-29 09:37:34')
    console.log('2021-01-29 09:39:27 发送完成')
});

socket.on('data', (data) => {
    console.log(`data->'${data.toString('utf8')}'`)
});

socket.on('drain', () => {
    console.log('drain')
});

socket.on('end', () => {
    console.log('end')
});

socket.on('error', (err) => {
    console.log('error', err)
});

socket.on('lookup', (err, address, family, host) => {
    console.log('lookup', err, address, family, host)
});

socket.on('timeout', () => {
    console.log('timeout')
});
