const mongoose = require('mongoose');
const {createVideoSchema} = require('./video')
const dbUrl = 'mongodb://localhost/douyin';
let maxConnectCount = 0;
const connect = () => {
    return new Promise((resolve, reject) => {
        mongoose.connect(dbUrl, { useUnifiedTopology: true, useNewUrlParser: true });
        mongoose.connection.on('disconnect', () => {
            if (maxConnectCount < 3) {
                maxConnectCount++;
                mongoose.connect(dbUrl);
            } else {
                reject('链接错误');
            }
        })
        mongoose.connection.on('error',()=>{
            if (maxConnectCount < 3) {
                maxConnectCount++;
                mongoose.connect(dbUrl);
            } else {
                reject('链接错误');
                throw new Error('连接出错');
            }
        })
        mongoose.connection.once('open',()=>{
            console.log('数据库连接成功');
            resolve();
        })
    })
}
module.exports = {
    connect,
    createVideoSchema
}