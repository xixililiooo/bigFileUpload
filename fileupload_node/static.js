const fse = require('fs-extra');
const path =require('path');
const mimeTypes = {
    'js': 'application/x-javascript',
    'html': 'text/html',
    'css': 'text/css',
    'txt': "text/plain",
    "mp4":"video/mp4"
  }
module.exports = async function(request,response,filePath){
    if(filePath=='/favicon.ico') return;
    const STATIC_PATH = path.resolve(__dirname,'./images');
    console.log(filePath);
    filePath = path.join(STATIC_PATH,filePath);
    try{
        let stats = await fse.stat(filePath);
        if(stats.isFile()){
            let ext = path.extname(filePath).split('.')[1].toLowerCase();
            let mimetype = ext?mimeTypes[ext]:mimeTypes['txt'];
            response.statusCode = 200;
            response.setHeader('content-type',mimetype);
            fse.createReadStream(filePath).pipe(response);
        }else if(stats.isDirectory()){
            let fileDir = await fse.readdir(filePath);
            response.end(fileDir.join(','));
        }
    }catch(err){
        console.log(err);
    }
}