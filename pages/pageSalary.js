const salary = require('../datalayer/salary');
const sendEmail = require('../modules/sendEmail');
const permission        = require('../modules/permission');
const {pageType}        = require('../modules/typePermission');
const router = require('express').Router;
const path = require('path');
const output = {};

output.router = router();
output.router.get('/'                       , hasPermission, getPageSalary);
output.router.get('/getDataSalary/:monthly' , hasPermission, getDataSalary);
output.router.get('/getDataSalaryMonth'     , hasPermission, getDataSalaryMonth);
output.router.get('/downloadReports/:monthly', hasPermission, downloadReports);
output.router.post('/sendEmailSalary'       , hasPermission, sendEmailSalary);
output.router.post('/updateSalary'          , hasPermission, updateSalary);
output.router.post('/deleteSalary'          , hasPermission, deleteSalary);


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
    const arr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    const data = [];

    for (let i = 2021; i < 2025; i++) {
        for (let j = 0; j < arr.length; j++) {
            const element = arr[j];
            data.push(`${i} ${element}`);
        }
        
    }

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
        salary.insertSalary({...bodyData, status_name : '???? g???i email.'});
        return res.status(200).send({ status :"finish", message: message, result: 'test'});
    } catch (e) {
        console.log(e);
        salary.insertSalary({...bodyData, status_name : 'g???i email b??? l???i.'});
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

function hasPermission(req, res, next) {
    if (req.session && req.session.roles) {
        const permisisons =  permission.buildPermisison(req.session.roles);
        if (permisisons.can('view', new pageType('salary'))) {
            next();
            return;
        }
    }
    res.status(200).send({ status :"no permission" });
}

module.exports = output;
