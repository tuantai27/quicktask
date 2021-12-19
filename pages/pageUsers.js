const system_data = require('../datalayer/system_data');
const hrm = require('../form/hrm');
const { pageType }      = require('../modules/typePermission');
const permission        = require('../modules/permission');
const router = require('express').Router;
const output = {};

output.router = router();
output.router.get('/' , hasPermission, getPage);
output.router.post('/add' , hasPermission, add);
output.router.post('/update' , hasPermission, update);
output.router.post('/remove' , hasPermission, remove);

async function getPage(req, res, next) {
    try {

        const setting = {
            categories : {}
        };
        const name = req.query.page;
        console.log(name);
        const { categories } = hrm;

        const queue = [];
        for (let i = 0; i < categories.length; i++) {
            const category = categories[i];
            queue.push(system_data.getListCategory(req.session.project_id, category));
        }
        const arr = await Promise.all(queue);
        for (let i = 0; i < arr.length; i++) {
            const element = arr[i];
            console.log(element);
            const keys = Object.keys(element);
            for (const key of keys) {
                setting['categories'][key] = element[key];
            }
        }
        
        console.log(setting)
        res.render('users', setting);
    } catch (error) {
        console.log(error);
    }
};

async function add(req, res, next) {
}

async function update(req, res, next) {
}

async function remove(req, res, next) {
}

function hasPermission(req, res, next) {
    if (req.session && req.session.roles) {
        const permisisons =  permission.buildPermisison(req.session.roles);
        if (permisisons.can('view', new pageType('users'))) {
            next();
            return;
        }
    }
    res.status(200).send({ status :"no permission" });
}
module.exports = output;
