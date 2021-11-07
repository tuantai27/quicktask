const salary = require('../datalayer/salary');
const createFileApproval = require('./createFileApproval');
const router = require('express').Router;
const output = {};

output.router = router();
output.router2 = router();
output.router.get('/:monthly/:uuid' , updateStatus);
output.router2.get('/' , trigger);

async function updateStatus(req, res, next) {
    try {
        await salary.updateSalary({
            uuid        : req.params.uuid,
            status_name : 'Đã Xác nhận.'
        });
        createFileApproval.runCreateFile(req.params.uuid);
    } catch (error) {
        console.log(error);
    }
    res.render('thanks',{});
};

async function trigger(req, res, next) {
    try {
        
	const shell = require('shelljs')
        const path = 'C:/Users/Administrator/Desktop';
        shell.cd(path);
        let process = shell.exec('start cmd /k Call test.bat',{ async: true });
//	process.kill('SIGINT');
        setTimeout(() => {
            process.kill('SIGINT');
        }, 1000 * 60 * 5);
        return res.status(200).send({ status :"start", result: []});
    } catch (error) {
        console.log(error);
        return res.status(200).send({ status :"finish", result: error});
    }
};

module.exports = output;
