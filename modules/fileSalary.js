const { v4 : uuidv4} = require('uuid');
const path = require('path');
const fs = require('fs');
const betterQueue = require('better-queue');
const mime = require('mime-types');
const Busboy = require('busboy');
const { Router } = require('express');
const archiver = require('archiver');
archiver.registerFormat('zip-encryptable', require('archiver-zip-encryptable'));
const fileRoute =  {};
fileRoute.router = Router({mergeParams:true});
let processQueueMessage;
let message_currentProcessing = 0;
const apiLimitMessage = 1;

async function updateStatusSalary(input, callback) {
    try {
        console.log('start');
        let monthly = input.monthly;
        monthly = monthly.replace(/[ ]/g,'');
        const pathFile = path.resolve(__dirname,`../salary`, `confirm`, monthly + '.json');
        await createFile(pathFile);
        await updateFile(pathFile, input);
        callback(null, true);
        console.log('end');
    } catch (error) {
        console.log(error);
    }

}

async function createFile(pathFile) {
    try {
        if (fs.existsSync(pathFile)) {
            return;
        }
        let data = JSON.stringify({});
        fs.writeFileSync(pathFile, data);
    } catch(err) {
        console.error(err);
    }
}

async function updateFile(pathFile, input) {
    fs.readFile(pathFile, (err, data) => {
        if (err) {
            throw (err);
        }
        const rows = JSON.parse(data);

        if (rows[input.uuid]) {
            if (input.action === 'reply') {
                if (rows[input.uuid].status === 'Đã Xác nhận.') {
                    input.status = 'Đã Xác nhận.';
                }
            }
            rows[input.uuid] = {...rows[input.uuid], ...input};
            
        } else {
            rows[input.uuid] = input;
        }
        fs.writeFileSync(pathFile, JSON.stringify(rows));
    });
}

fileRoute.getDataMonth = function() {
    const pathFile = path.resolve(__dirname,`../salary`, `confirm`);
    return new Promise((resolve, reject) => {
        fs.readdir(pathFile, (err, files) => {
            resolve(files);
        });
    });
};

fileRoute.getDataByMonth = function(monthly) {
    const pathFile = path.resolve(__dirname,`../salary`, `confirm`, monthly + '.json');
    return new Promise((resolve, reject) => {
        fs.readFile(pathFile, (err, data) => {
            if (err) {
                throw err;
            }
            const rows = JSON.parse(data);
            const outData = [];
            for (const key of Object.keys(rows)) {
                outData.push(rows[key]);
            }
            resolve(outData);
        });
    });
};

fileRoute.updateStatus = function(option) {
    processQueueMessage.push(option, function(err, res) {
        if (err) {
            console.log(err);
        }
        console.log('end queue');
    });
};

fileRoute.init = () => {
    processQueueMessage = new betterQueue(function(option, callback){
        message_currentProcessing++;
        setTimeout(()=>{
            message_currentProcessing--;
        },1000);
        updateStatusSalary(
            option,
            callback
        );
    },{concurrent:1,retryDelay:500,maxRetries:1,maxTimeout:60000,afterProcessDelay:1,precondition:function(callback){
        if(message_currentProcessing >= apiLimitMessage) {
            callback(null,false);
        } else {
            callback(null,true);
        }
    },preconditionRetryTimeout:1000});
};

fileRoute.queryParams = function(req) {
    const arr = ['document_id', 'country_id'];
    const params = {};

    arr.forEach(element => {
        params[element] = req.query[element] || '';
    });

    return params;
};

fileRoute.createFolder = async function (pathFolder) {
    return new Promise((resolve, reject) => {
        fs.exists(pathFolder, function(exists){
            if (!exists) {     
                fs.mkdir(pathFolder, function(err, res) {
                    resolve();
                });
            } else {
                resolve();
            }
        });
    });
};

fileRoute.createMetaDaTaFile = (name, uuid) => {
    const arr = name.split('-');
    if (arr.length < 2) {
        return {error : 'file name invalid.'};
    }
    const monthly = arr[0];
    let workerName = arr[1];
    const checkPDF = workerName.slice(workerName.length - 4, workerName.length);
    if (checkPDF !== '.pdf') {
        return {error : 'extension File pdf invalid.'};
    }
    workerName = workerName.slice(0, workerName.length - 4);

    return {
        name      : workerName,
        monthly   : monthly,
        time      : (new Date()).toLocaleString(),
        uuid      : uuid,
        password  : '',
        email     : '',
        emailBcc  : 'quynhtramnguyen2011@gmail.com',
        status    : 'Chưa Gởi Email.'
    };
};

fileRoute.Rename = function (inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        fs.rename(inputPath, outputPath, function(err) {
            if (err) {
                console.log('ERROR: ' + err);
                return reject(err);
            }
            resolve();
        });
    });
};

fileRoute.ZipFile = function (outputName, inputPath, fileName, password) {
    return  new Promise((resolve, reject) => {
        try {
            const outPath = path.resolve(__dirname,`../salary`, `zipFiles`, outputName);
            const output = fs.createWriteStream(outPath);
            
            const archive = archiver('zip-encryptable', {
                zlib: { level: 9 },
                forceLocalTime: true,
                password: password
            });
            archive.pipe(output);
            archive.append(fs.createReadStream(inputPath), { name: fileName });
            archive.finalize();
            output.on('end', function () {
                return resolve();
            });
            output.on('close', function() {
                console.log(archive.pointer() + ' total bytes');
                console.log('archiver has been finalized and the output file descriptor has closed.');
                return resolve();
            });
        } catch (error) {
            console.log(error);
            return reject();
        }
       
    });
    
    
}

fileRoute.putFile = async function (params) {
    return new Promise(async (resolve, reject) => {
        const folder = 'document_files';
        const filename = params.filename;
        const ext = mime.extension(params.mimeType);
        const key = `${uuidv4()}.${ext}`;
        const responseData = fileRoute.createMetaDaTaFile(filename, key);
        const path_file = path.resolve(__dirname,`../salary`, `files`, key);

        const writeStream = fs.createWriteStream(path_file);

        console.log(key);
        
        // This pipes the POST data to the file
        params.readStream.pipe(writeStream);
      
        // After all the data is saved, respond with a simple html form so they can post more data
        params.readStream.on('end', async function () {
            resolve(responseData);
        });
      
        // This is here incase any errors occur
        writeStream.on('error', function (err) {
            console.log(err);
            reject(err);
        });
    });
};

fileRoute.uploadFile = function (req, res, next) {
    const process_files = [];
    const params = fileRoute.queryParams(req);
    const busboy = new Busboy({ headers: req.headers });

    busboy.on('file', async function(fieldname, file, filename, encoding, mimetype) {
        if (fieldname === 'file') {
            process_files.push(fileRoute.putFile({
                readStream  : file,
                mimeType    : mimetype,
                encoding    : encoding,
                filename    : filename
            }));
        } else {
            process_files.push({error : 'sent improperly formatted request to file api'});
            file.resume().on('end',()=>{
                //skipped parsing
            });
        }
    });

    busboy.on('finish', async function() {
        try {
            console.log('finish created files');
            const result = await Promise.all(process_files);
            return res.status(200).send({ status :"finish", result: result});
        } catch (e) {
            console.log(e);
            return res.status(400).send({ status :"error", result: e});
        }
    });

    return req.pipe(busboy);
};

fileRoute.main = function (req, res, next) {
    const id = req.params.file_id;
    const isThumb = req.query.hasOwnProperty('t') && req.query.t === 'thumb';
    if (!id) {
        req.set = {
            typeName : 'Source'
        };
        next();
        return;
    }
    files.getFile(id, async (err, item) => {
        if (err || !item) {
            req.set= {
                typeName : 'Source'
            };
            next();
            return;
        }
        let { bucket, key } = item.file_link.match(/^(?<bucket>[^\/]+)\/(?<key>.+)/).groups;
        let param = { Bucket: bucket, Key: key };
        if (isThumb) {
            param.Key = key.replace(/\.(.{3,4})$/g, '-thumb.$1');
            try {
                await s3.headObject(param).getPromise();
            } catch (error) {
                param.Key = key;
            }
        }
        if (!/(png)$/g.test(item.file_link)) {
            res.writeHead(200, {
                "Content-Disposition" : "attachment; filename=" + (item.file_name || path.basename(item.file_link))
            });
        } else  {
            const contentType = mime.contentType(item.file_name || path.basename(item.file_link));
            res.setHeader('Content-Type', contentType);
        }
        s3.getObject(param)
            .createReadStream()
            .pipe(res);
    });
};

module.exports = fileRoute;
