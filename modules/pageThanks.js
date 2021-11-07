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
        createFileApproval(req.params.uuid);
    } catch (error) {
        console.log(error);
    }
    res.render('thanks',{});
};

async function trigger(req, res, next) {
    try {
        var spawn = require('child_process').spawn,
        ls    = spawn('cmd.exe', ['/c', 'test.bat']);

        ls.stdout.on('data', function (data) {
            console.log('stdout: ' + data);
        });

        ls.stderr.on('data', function (data) {
            console.log('stderr: ' + data);
        });

        ls.on('exit', function (code) {
            console.log('child process exited with code ' + code);
        });
    } catch (error) {
        console.log(error);
    }
    res.render('thanks',{});
};

module.exports = output;
