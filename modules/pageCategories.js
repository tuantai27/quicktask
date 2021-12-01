const system_data = require('../datalayer/system_data');
const hrm = require('../form/hrm');
const router = require('express').Router;
const output = {};

output.router = router();
output.router.get('/' , getPage);

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
        res.render('page_categories', setting);
    } catch (error) {
        console.log(error);
    }
};

module.exports = output;
