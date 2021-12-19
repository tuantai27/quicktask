const system_data = require('../datalayer/system_data');
const categories = require('../datalayer/categories');
const categories_detail = require('../datalayer/categories_detail');
const { pageType }      = require('../modules/typePermission');
const permission        = require('../modules/permission');
const hrm = require('../form/hrm');
const router = require('express').Router;
const output = {};

output.router = router();
output.router.get('/' , hasPermission, getPage);
output.router.post('/add', hasPermission, add);
output.router.post('/update', hasPermission, update);
output.router.post('/remove', hasPermission, remove);

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
        // setting.hasPermissionAdd    = hasPermission(req, 'Add');
        // setting.hasPermissionUpdate = hasPermission(req, 'Update');
        // setting.hasPermissionRemove = hasPermission(req, 'Remove');
        // setting.hasPermissionSearch = hasPermission(req, 'Search');
        console.log(setting)
        res.render('page_categories', setting);
    } catch (error) {
        console.log(error);
    }
};

async function add(req, res, next) {
    try {
        const body = req.body;
        console.log(body);

    } catch (error) {
        
    }
}

async function update(req, res, next) {
}

async function remove(req, res, next) {
}

function hasPermission(req, res, next) {
    if (req.session && req.session.roles) {
        const permisisons =  permission.buildPermisison(req.session.roles);
        if (permisisons.can('view', new pageType('categories'))) {
            next();
            return;
        }
    }
    res.status(200).send({ status :"no permission" });
}


module.exports = output;
