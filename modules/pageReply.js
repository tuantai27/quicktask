const salary = require('../datalayer/salary');
const router = require('express').Router;
const output = {};

output.router = router();
output.router.get('/:monthly/:uuid' , getPageReply);
output.router.post('/:monthly/:uuid' , postReply);

async function getPageReply(req, res, next) {
    try {
        res.render('replySalary',{});
    } catch (error) {
        console.log(error);
    }
};

async function postReply(req, res, next) {
    const bodyData = JSON.parse(req.query.bodyData);
    const comment = bodyData.comment;

    try {
        salary.updateSalary({
            uuid        : req.params.uuid, 
            status_name : 'có ý kiến.',
            comment     : comment
        });
    } catch (error) {
        console.log(error);
    }

    return res.status(200).send({ status :"finish", result: []});
};

module.exports = output;
