const salary = require('../datalayer/salary');
const sendEmail = require('./sendEmail');
const router = require('express').Router;
const path = require('path');
const output = {};

output.router = router();
output.router.get('/'                       , getPageSalary);
output.router.get('/getDataSalary/:monthly' , getDataSalary);
output.router.get('/getDataSalaryMonth'     , getDataSalaryMonth);
output.router.get('/downloadReports/:monthly', downloadReports);
output.router.post('/sendEmailSalary'       , sendEmailSalary);
output.router.post('/updateSalary'          , updateSalary);
output.router.post('/deleteSalary'          , deleteSalary);


async function deleteSalary(req, res, next) {
    const {uuid} = req.body;
    console.log(uuid);
    salary.deleteSalary(uuid);
    return res.status(200).send({ status :"finish", result: []});
};

async function updateSalary(req, res, next) {
    const bodyData = req.body;
    console.log(bodyData);
    salary.updateSalary(bodyData);
    return res.status(200).send({ status :"finish", result: []});
};

async function getPageSalary(req, res, next) {
    res.render('indexSalary',{});
};

async function getDataSalary(req, res, next) {
    const data = await salary.selectSalaryMonthly(req.params.monthly);
    return res.status(200).send({ status :"finish", result: data});
};

async function getDataSalaryMonth(req, res, next) {
    const data = [
        '2021 Dec',
        '2021 Nov',
        '2021 Oct',
        '2021 Sep',
        '2021 Aug',
        '2021 Jul',
        '2021 Jun',
        '2021 May'
    ];
    return res.status(200).send({ status :"finish", result: data});
};

async function sendEmailSalary(req, res, next) {
    const bodyData = JSON.parse(req.query.bodyData);
    try {
        const {uuid, subDetail} = bodyData;

        const inputPath = path.resolve(__dirname,`../salary`, `files`, uuid);
        const outputName = `${bodyData.monthly}-${bodyData.name}.pdf`;
        const attachments = [];

        const mainFile = await sendEmail.getFile(outputName, inputPath);
        attachments.push(mainFile);
        console.log(attachments);
        if (subDetail && Array.isArray(subDetail) && subDetail.length > 0) {
            for (let i = 0; i < subDetail.length; i++) {
                const subUUID = subDetail[i];
                const subInputPath = path.resolve(__dirname,`../salary`, `files`, subUUID);
                console.log(subInputPath);
                const subFileName = `${bodyData.monthly}-${bodyData.name}-${i + 1}.pdf`;
                const subFile = await sendEmail.getFile(subFileName, subInputPath);
                attachments.push(subFile);
            }
        }

        const message = await sendEmail.send(bodyData.monthly, bodyData.name, bodyData.email, bodyData.emailBcc, bodyData.uuid, attachments);
        salary.insertSalary({...bodyData, status_name : 'đã gởi email.'});
        return res.status(200).send({ status :"finish", message: message, result: 'test'});
    } catch (e) {
        console.log(e);
        salary.insertSalary({...bodyData, status_name : 'gởi email bị lỗi.'});
        return res.status(400).send({ status :"error", result: e});
    }
};


async function downloadReports(req, res, next) {
    if(req.session.User){
        const monthly = req.params.monthly;
        const filePath =  path.resolve(__dirname, "salary", "confirm", `${monthly}.json`); 
        
        console.log(filePath);            
        // Content-type is very interesting part that guarantee that
        const file = fs.createReadStream(filePath);
        const stat = fs.statSync(filePath);
        res.setHeader('Content-Length', stat.size);
        res.setHeader('Content-Type', 'application/json');
        file.pipe(res);   
    } else {
        return res.status(200).send({ status :"error", result: 'you need login.'});
    }
    
};

module.exports = output;
