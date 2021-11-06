const database  = require('./modules/database');
const createFileApproval  = require('./modules/createFileApproval');
const salary  = require('./datalayer/salary');
const fs = require('fs');
const m_db      = new database();

(async ()=>{
    try {
        //import data;
        salary.init(m_db);
        const result = await salary.selectSalaryMonthly('2021jun');
        

        // fs.readdir('./salary/files', (err, files) => {
        //     files.forEach(file => {
        //          for (let i = 0; i < result.length; i++) {
        //             const {uuid, name} = result[i];
        //             if (file.includes(name)) {
        //                 console.log(uuid);
        //                 console.log(name);
        //                 console.log(file);
        //                 fs.rename(`./salary/files/${file}`, `./salary/files/${uuid}`, function(err) {
        //                     if ( err ) console.log('ERROR: ' + err);
        //                 });
        //             }
        //         }
                
        //     });
        // });
        for (let i = 0; i < result.length; i++) {
            const {uuid, name} = result[i];
            await createFileApproval.runCreateFile(uuid);
        }
        
       
    } catch (error) {
        console.log(error);
    }
    console.log('end');
})();


async function test (obj, db) {
    const keys = Object.keys(obj);
    const sql       = [`insert into salary (email, emailBcc, monthly, name, status_name, uuid, comment) VALUES `];
    const params    = [];
    const sql2      = [];

    for (const key of keys) {
        const {email, emailBcc, monthly, name, status, uuid, comment} = obj[key];
        params.push(email);
        params.push(emailBcc);
        params.push(monthly);
        params.push(name);
        params.push(status);
        params.push(uuid);
        params.push(comment);
        sql2.push(`(?, ?, ?, ?, ?, ?, ?)`);
    }

    sql.push(sql2.join(','));
    await db.query(sql.join(' '), params);
    return;
}