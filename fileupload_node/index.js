let path = require('path');
let fse = require('fs-extra');
let http = require('http');
const mongoose = require('mongoose');
const {connect,createVideoSchema} = require('./db/init')
const Controller = require('./controller');
const staticHandle = require('./static')
let controller = new Controller();
let app = http.createServer();
app.on('request',async (req,res)=>{
    res.setHeader('Access-Control-Allow-Origin',"*");
    res.setHeader('Access-Control-Allow-Headers',"*");
    if(req.method === 'OPTIONS'){
        res.status = 200;
        return res.end();
    }
    if(req.url == '/verify'){
        await controller.handleVerifyUpload(req,res);
    }
    else if(req.url == '/'){

        await controller.handleUpload(req,res);
    }
    else if(req.url == '/merge'){
        await controller.handleMerge(req,res);
    }
    else{
        await staticHandle(req,res,req.url);
        
    }
});
(async ()=>{
    await connect();
    createVideoSchema();
})()
app.listen(3000,()=>{
    console.log('正在监听3000端口');
})