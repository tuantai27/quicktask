const {  v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');
const Busboy = require('busboy');
const { Router } = require('express');
const fileRoute =  {};
fileRoute.router = Router({mergeParams:true});

fileRoute.queryParams = function(req) {
    const arr = ['document_id', 'country_id'];
    const params = {};

    arr.forEach(element => {
        params[element] = req.query[element] || '';
    });

    return params;
};

fileRoute.putFile = function (params) {
    return new Promise((resolve, reject) => {
        const ext = mime.extension(params.mimeType);
        const key = `${uuidv4()}.${ext}`;
        const path_file = path.resolve(__dirname,`../client`,`files`,`${key}`);
        const writeStream = fs.createWriteStream(path_file);

        console.log(key);
        
        // This pipes the POST data to the file
        params.readStream.pipe(writeStream);
      
        // After all the data is saved, respond with a simple html form so they can post more data
        params.readStream.on('end', function () {
            resolve(key);
        });
      
        // This is here incase any errors occur
        writeStream.on('error', function (err) {
            console.log(err);
            reject(err);
        });
    });
};

fileRoute.deleteFile = function (req, res, next) {
    // const process_files = [];
    const id = req.params.file_id;
    const path_file = path.resolve(__dirname,`../client`,`files`,`${id}`);
    console.log(id);
    console.log(path_file);

    fs.unlink(path_file, function(err){
        if(err) {
            return res.status(400).send({ status :"error", result: 'file deleted error'});
        } 
        return res.status(200).send({ status :"success", result: 'file deleted successfully'});
        // console.log('file deleted successfully');
    });
    // return req.pipe(busboy);
};

fileRoute.uploadFile = function (req, res, next) {
    const process_files = [];
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

fileRoute.downloadFile = function (req, res, next) {
    const id = req.params.file_id;
    const path_file = path.resolve(__dirname,`../client`,`files`,`${id}`);
    console.log(id);
    console.log(path_file);
    // const isThumb = req.query.hasOwnProperty('t') && req.query.t === 'thumb';
    // if (!id) {
    //     req.set = {
    //         typeName : 'Source'
    //     };
    //     next();
    //     return;
    // }
    // files.getFile(id, async (err, item) => {
    //     if (err || !item) {
    //         req.set= {
    //             typeName : 'Source'
    //         };
    //         next();
    //         return;
    //     }
    //     let { bucket, key } = item.file_link.match(/^(?<bucket>[^\/]+)\/(?<key>.+)/).groups;
    //     let param = { Bucket: bucket, Key: key };
    //     if (isThumb) {
    //         param.Key = key.replace(/\.(.{3,4})$/g, '-thumb.$1');
    //         try {
    //             await s3.headObject(param).getPromise();
    //         } catch (error) {
    //             param.Key = key;
    //         }
    //     }
    //     if (!/(png)$/g.test(item.file_link)) {
    //         res.writeHead(200, {
    //             "Content-Disposition" : "attachment; filename=" + (item.file_name || path.basename(item.file_link))
    //         });
    //     } else  {
    //         const contentType = mime.contentType(item.file_name || path.basename(item.file_link));
    //         res.setHeader('Content-Type', contentType);
    //     }
    //     s3.getObject(param)
    //         .createReadStream()
    //         .pipe(res);
    // });
};

module.exports = fileRoute;
