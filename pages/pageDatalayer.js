const main = require('../datalayer/main');
const hrm = require('../form/hrm');
const system_data = require('../datalayer/system_data');
const router = require('express').Router;
const out = require('../datalayer/index_data');
const output = {
    db : null
};

output.init = function (db) {
    output.db = db;
    main.init(db);
    system_data.init(db);
};

output.router = router();
output.router.post('/i/:table_name', insertData);
output.router.put('/u/:table_name/:uuid', updateData);
output.router.get('/s/:table_name', getRows);
output.router.get('/s/:table_name/:uuid', getRow);
output.router.delete('/d/:table_name/:uuid', deleteData);

async function insertData(req, res, next) {
    try {
        let {table_name, uuid} = req.params;
        if (main.isUUID(uuid) === false) {
            uuid = main.createUUID();
        }
        const {row} = req.body;
        const table_id = await main.getTableId({
            table_name : table_name,
            project_id  : req.session.project_id
        });

        if (table_id) {
            await main.iData({
                project_id  : req.session.project_id, 
                uuid        : uuid, 
                table_id    : table_id, 
                meta_data   : row, 
                UserId      : req.session.UserId
            });
            return res.status(200).send({ status :"sucess", result: 'inserted'});
        } else {
            console.log(`error table find not found`);
            console.log(table_name);
            return res.status(401).send({ status :"error", result: 'not found'});
        }
        
    } catch (error) {
        console.log(error);
        return res.status(401).send({ status :"error", result: error});
    }
};

async function updateData(req, res, next) {
    try {
        let {table_name, uuid} = req.params;
        if (main.isUUID(uuid) === false) {
            uuid = main.createUUID();
        }
        const {row} = req.body;
        const table_id = await main.getTableId({
            table_name : table_name,
            project_id  : req.session.project_id
        });

        if (table_id) {
            const oldRow = await main.getRow({
                uuid        : uuid,
                table_id    : table_id,
                project_id  : req.session.project_id
            })

            if (oldRow) {
                console.log(`update`);
                await main.uData({
                    project_id  : req.session.project_id, 
                    uuid        : uuid, 
                    table_id    : table_id, 
                    meta_data   : row, 
                    UserId      : req.session.UserId
                }, hrm.index, oldRow.id);
                
                return res.status(200).send({ status :"success", result: 'updated'});
            } else {
                console.log(`insert`);
                await main.iData({
                    project_id  : req.session.project_id, 
                    uuid        : uuid, 
                    table_id    : table_id, 
                    meta_data   : row, 
                    UserId      : req.session.UserId
                }, hrm.index);
                
                return res.status(200).send({ status :"success", result: 'inserted'});
            }
            
        }
        return res.status(401).send({ status :"error", result: 'not found'});

    } catch (error) {
        console.log(error);
        return res.status(401).send({ status :"error", result: error});
    }
};

async function getRow(req, res, next) {
    try {
        const {table_name, uuid} = req.params;
        const table_id = await main.getTableId({
            table_name : table_name,
            project_id  : req.session.project_id
        });

        if (table_id) {
            const oldRow = await main.getRow({
                uuid        : uuid,
                table_id    : table_id,
                project_id  : req.session.project_id
            });
            return res.status(200).send({ status :"sucess", result: oldRow});

        }
    } catch (error) {
        console.log(error);
    }
};

async function getRows(req, res, next) {
    try {
        const {table_name} = req.params;
        const {row} = req.query;
        const table_id = await main.getTableId({
            table_name : table_name,
            project_id  : req.session.project_id
        });

        if (table_id) {
            const rows = await hrm.search(table_id, row, req.session, out.db);
            return res.status(200).send({ status :"sucess", result: rows});
        }
    } catch (error) {
        console.log(error);
    }
};


async function deleteData(req, res, next) {
    try {
        const {table_name, uuid} = req.params;
        const table_id = await main.getTableId({
            table_name : table_name,
            project_id  : req.session.project_id
        });
        await main.dData({
            project_id  : req.session.project_id, 
            uuid        : uuid, 
            table_id    : table_id
        });
        return res.status(200).send({ status :"sucess", result: 'deleted'});

    } catch (error) {
        console.log(error);
    }
};

module.exports = output;
