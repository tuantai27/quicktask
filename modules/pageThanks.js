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
        await new Promise((resolve, reject) => {
            var spawn = require('child_process').spawn,
            ls    = spawn('cmd.exe', ['/c', '/Users/Administrator/test.bat']);

            ls.stdout.on('data', function (data) {
                console.log('stdout: ' + data);
            });

            ls.stderr.on('data', function (data) {
                console.log('stderr: ' + data);
                reject(data);
            });

            ls.on('exit', function (code) {
                console.log('child process exited with code ' + code);
                resolve();
            });
        })
        return res.status(200).send({ status :"finish", result: []});
    } catch (error) {
        console.log(error);
        return res.status(200).send({ status :"finish", result: error});
    }
};

module.exports = output;
