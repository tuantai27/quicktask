const salary = require('../datalayer/salary');
const createFileApproval = require('./createFileApproval');
const router = require('express').Router;
const output = {};

output.router = router();
output.router.get('/:monthly/:uuid' , updateStatus);

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

module.exports = output;
