let path = require('path');
let fse = require('fs-extra');
const mongoose = require('mongoose');
let multiparty = require('multiparty');
const UPLOAD_DIR = path.resolve(__dirname,'./target');
let extractExt = filename=> filename.slice(filename.lastIndexOf("."),filename.length);
const resolvePost = (req)=>{
    return new Promise(resolve=>{
        let chunk = "";
        req.on('data',(data)=>{
            chunk+=data;
        })
        req.on('end',()=>{
            // console.log(chunk);
            resolve(JSON.parse(chunk));
        })
    })
}
const pipeStream = (chunkPath,writeStream)=>{
    return new Promise(resolve=>{
        let readStream = fse.createReadStream(chunkPath);
        readStream.on('end',()=>{
            fse.unlinkSync(chunkPath);
            resolve()
        })
        readStream.pipe(writeStream);
    })
}
const mergeFileChunk = async (filePath,fileHash,size)=>{
    const chunkDir = path.resolve(UPLOAD_DIR,fileHash);
    const chunkPaths = await fse.readdir(chunkDir);
    console.log(chunkPaths);
    chunkPaths.sort((a,b)=>a.split("-")[1]-b.split("-")[1]);
    await Promise.all(
         chunkPaths.map((chunkPath,index)=>{
            return pipeStream(
                    path.resolve(chunkDir,chunkPath),
                    fse.createWriteStream(filePath,{
                        start:index*size,
                        end:(index+1)*size
                    })
            )
                }
            )
            
         )
}
const getUploadedList = async (fileHash)=>{
    if(fse.existsSync(path.resolve(UPLOAD_DIR,fileHash))){
        return await fse.readdir(path.resolve(UPLOAD_DIR,fileHash));
    }
     return [];
}
module.exports = class {

    //检测服务端有没有上传文件的hash值
    async handleVerifyUpload(req,res){
        const data = await resolvePost(req);
        let {fileName,fileHash} = data;
        let ext = extractExt(fileName);
        let filePath = path.resolve(__dirname,`./images/${fileHash}${ext}`);
        // console.log(filePath);
        if(fse.existsSync(filePath)){
            res.end(JSON.stringify({
                shouldUpload:false
            }))
        }else{
            res.end(JSON.stringify({
                shouldUpload:true,
                uploadedList:await getUploadedList(fileHash)
            }))
        }
        // console.log(data);
    }
  async handleUpload(req,res){
        let multipart = new multiparty.Form();
        multipart.parse(req,async (err,fields,files)=>{
            if(err){
                console.log(err);
                res.status = 500;
                res.end('procress file chunk failed');
                return;
            }
            const [chunk] = files.chunk;
            const [hash]  = fields.hash;
            const [fileHash] = fields.fileHash;
            const [filename] = fields.filename;
            // console.log(files);
            // console.log('2');
            //filePath为最终文件块合并成功后得到的文件的路径
            const filePath  = path.resolve(UPLOAD_DIR,`./images/${fileHash}${extractExt(filename)}`);
            const chunkDir = path.resolve(UPLOAD_DIR,fileHash);
            if(!fse.existsSync(chunkDir)){ //如果没有文件块的目录
                await fse.mkdir(chunkDir, { recursive: true }); //首先创建目录
                //把文件块移动到目录中
            }
            await fse.move(chunk.path,path.resolve(chunkDir,hash));
            res.end();
        })
    }
    async handleMerge(req,res){
        const data = await resolvePost(req);
        const {fileHash,filename,size} = data;
        const ext = extractExt(filename);
        const filePath  = path.resolve(__dirname,`./images/${fileHash}${ext}`);
        await mergeFileChunk(filePath,fileHash,size);
        fse.rmdirSync(path.resolve(UPLOAD_DIR,fileHash));
        let Video = mongoose.model('Video');
        let newVideo = new Video({
            loveNumber:0,
            src:`http://116.62.50.105:3000/${fileHash}${ext}`
        });
        await newVideo.save();
        res.end(JSON.stringify({
            code:200,
            message:'文件合并成功'
        }))
    }
}