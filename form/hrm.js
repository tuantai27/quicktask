const index_data = require('../datalayer/index_data');
const out = {
    categories : ['company', 'status', 'sex'],
    index : [
        {input : '$.worker_name'      , output : 'name'       , type : 'string'},
        {input : '$.time.day_from'    , output : 'startDate'  , type : 'date'},
        {input : '$.time.day_to'      , output : 'endDate'    , type : 'date'},
        {input : '$.company_name'     , output : 'company'    , type : 'int'},
        {input : '$.status'           , output : 'status'     , type : 'int'}
    ],
    checkDuplicate : function () {

    },
    search : async function (table_id, row, {project_id}, db) {
        const sql = [];
        let params = [];
        if (typeof row === "string") {
            try {
                row = JSON.parse(row);
            } catch (error) {
                console.log(error);
            }
        }
        const  {status_name, day_from, day_to, company_name} = row;

        sql.push(`select    atd.uuid                               as uuid,`);
        sql.push(`          atd.meta_data->"$.company_id"          as company_id,`);
        sql.push(`          atd.meta_data->"$.company_name"        as company_name,`);
        sql.push(`          atd.meta_data->"$.worker_name"         as worker_name,`);
        sql.push(`          atd.meta_data->"$.email_cong_ty"       as email_cong_ty,`);
        sql.push(`          atd.meta_data->"$.email_ca_nhan"       as email_ca_nhan,`);
        sql.push(`          atd.meta_data->"$.status"              as status,`);
        sql.push(`          atd.meta_data->"$.time"                as time,`);
        sql.push(`          atd.meta_data->"$.sNpT"                as sNpT`);
        sql.push(`from      all_data_table atd`);
        sql.push(`where     atd.project_id  = ?`);
        sql.push(`and       atd.table_id    = ?`);
        params.push(project_id);
        params.push(table_id);

        if (Array.isArray(status_name) && status_name.length > 0) {
           sql.push(filter('idx_int_data', 3, 'in', status_name.length));
           params = params.concat(status_name);
        }

        //if (day_to) {
        //    sql.push(filter('idx_date_data', 5, '<='));
        //    params.push(index_data.setValue(day_to,'date'));
        //}

        //if (day_from) {
        //    sql.push(filter('idx_date_data', 6, '>='));
        //    params.push(index_data.setValue(day_from,'date'));
        //}
        
        if (company_name && company_name != 17) {
           sql.push(filter('idx_int_data', 2, '='));
           params.push(company_name);
        }

        
        console.log(sql.join(' \n '));
        console.log(params);
        console.log(row);
        // console.log(typeof row);
        // console.log(row.company_name);
        try {
            const result = await db.query(sql.join(' \n '), params);

            if (result && Array.isArray(result) && result.length > 0) {
                return result;
            }
            
        } catch (error) {
            console.log(error);
        }
        return [];
    }
};


function filter(table_name, column_id, operator = '=', len) {
    const sql = [];
    let fillParams = '?';
    if (operator === 'in') {
        fillParams = `(${',?'.repeat(len).slice(1)})`;
    }

    sql.push(`and  atd.id in (`);
    sql.push(`      select  id`);
    sql.push(`      from    ${table_name}`);

    if (table_name === 'idx_int_data') {
        sql.push(`      where   int_value ${operator} ${fillParams}`);

    } else if (table_name === 'idx_string_data') {
        sql.push(`      where   string_value ${operator} ${fillParams}`);

    } else {
        sql.push(`      where   date_value ${operator} ${fillParams}`);
    }
    
    sql.push(`      and     column_id  = ${column_id}`);
    sql.push(`    )`);

    return sql.join(' \n ');
}

module.exports = out;