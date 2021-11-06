const path              = require('path');
const fs                = require('fs');
const mainCreateFile    = require('../tool-excel-pdf/main');
const router            = require('express').Router;
const output = {
    browser : null
};

output.init = function (browser){
    output.browser = browser;
}

output.router = router();
output.router.get('/', getPageExcel);
output.router.get('/getFileById/:id', getFileById);
output.router.post('/getDataFromUUID', getDataFromUUID);
output.router.post('/createFile', createFile);

async function getPageExcel(req, res, next) {
    res.render('indexExcel',{});
};

async function createFile(req, res, next) {
    try {
        const bodyData = JSON.parse(req.query.bodyData);
        const result = await mainCreateFile.createFile(bodyData, output.browser);
        return res.status(200).send({ status :"finish", result:result});
    } catch (e) {
        console.log(e);
        return res.status(400).send({ status :"error", result: e});
    }
};

async function getFileById(req, res, next) {
    const fileName =  req.params.id; 
    const filePath =  path.resolve(fileName); 
    
    // Check if file specified by the filePath exists 
    fs.exists(filePath, function(exists){
        if (exists) {     
            // Content-type is very interesting part that guarantee that
            const file = fs.createReadStream(filePath);
            const stat = fs.statSync(filePath);
            res.setHeader('Content-Length', stat.size);
            res.setHeader('Content-Type', 'application/pdf');
            file.pipe(res);

            fs.unlink(filePath,function(err){
                if(err) {
                    return console.log(err);
                } 
                console.log('file deleted successfully');
            });
        } else {
            res.writeHead(400, {"Content-Type": "text/plain"});
            res.end("ERROR File does not exist");
        }
    });
};

async function getDataFromUUID(req, res, next) {
    try {
        const fileName = req.query.uuid;
        const pathFile = path.join(__dirname, '../client', 'files', fileName);
        const data = await mainCreateFile.getDataFile(pathFile);
        res.status(200).send({ status :"finish", result: data});
    } catch (e) {
        console.log(e);
        return res.status(400).send({ status :"error", result: e});
    }
};

module.exports = output;
