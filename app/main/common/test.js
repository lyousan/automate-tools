
let flag = false
function test(timer) {
    console.log('doing...');
    setTimeout(() => {
        console.log('finish');
        flag = true;
        clearTimeout(timer)
    }, 1000)
}
let timer = setTimeout(() => {
    if (!flag) {
        console.log(123);
    }
}, 2000);
test(timer)

