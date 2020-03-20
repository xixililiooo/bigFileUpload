let fse = require('fs-extra');
let path = require("path");
let target = path.resolve(__dirname,'./target/image');
if(!fse.existsSync(target)){
    fse.mkdir(target,{ recursive: true });
}