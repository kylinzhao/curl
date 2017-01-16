let exec = require('child_process')['exec'];
let transObj2Str = (obj) => {
    let list = []
    for(let key in obj){
        list.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
    }
    return list.join('&')
};


// TODO: 扩展更多属性以及response header信息
module.exports = (options = {}) => new Promise((resolve, reject) => {
    let args = [];
    if(!options.url){
        reject();
    }

    args.push('curl', `'${options.url}'`)
    if(options.proxy){
        args = args.concat(['-x, --proxy', `'${options.proxy}'`])
    }

    if(options.headers){
        args = args.concat(transHeader(options.headers))
    }

    if(options.method === 'POST' && options.data){
        args = args.concat(transData(options.data));
    }

    let isTimeout = false;
    let timeoutHandler;
    if(options.timeout){
        timeoutHandler = setTimeout(() => {
            isTimeout = true;
            reject('TIMEOUT');
        }, options.timeout)
    }

    args.push('--compressed');

    let _curl = args.join(' ')

    console.log(_curl);

    exec(_curl, {
        encoding : 'utf-8'
    }, (error ,stdout, stderr) => {

        error && reject(error);

        if(isTimeout){
            return;
        }else{
            clearTimeout(timeoutHandler);
        }

        let result = stdout;
        console.log('curl data received: ', result);
        if(options.json){
            try{
                result = JSON.parse(result);
            }catch(e){
                result = {
                    data : result
                }
            }
        }
        resolve(result)
    })
})

let transHeader = (headers) => {
    let arr = []
    for(let key in headers){
        arr.push('-H', `'${key}: ${headers[key]}'`);
    }
    return arr;
}

let transData = (data) => {
    let _data = transObj2Str(data);
    return ['--data', `'${_data}'`]
}
