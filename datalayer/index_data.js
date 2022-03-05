const jp = require('jsonpath');
const out = {
    db : null,
    schemas : null
};

out.init = (db, schemas = 'quicktask') => {
    out.db = db;
    out.schemas = schemas;
    out.dataTable = {
        'string' : {
            table_name : 'idx_string_data',
            column_value : 'string_value'
        },
        'date' : {
            table_name : 'idx_date_data',
            column_value : 'date_value'
        },
        'int' : {
            table_name : 'idx_int_data',
            column_value : 'int_value'
        },
    };
};


out.getTable = (type) => {
    return out.dataTable[type];
};

out.setValue = (input, type) => {
    try {
        // console.log(meta_data);
        console.log(input);
        if (type === 'date') {
            input = stringToDate(input,'dd-mm-yyyy','-');
            if (!isValidDate(input)) {
                return null;
            }
        }
        console.log(`type %s : %o`, type, input);
        return input;
    } catch (error) {
        console.log(error);
    }
};

out.getValue = (input, meta_data, type) => {
    try {
        // console.log(meta_data);
        console.log(input);
        let value = jp.value(meta_data, input);
        if (type === 'date') {
            console.log(value);
            value = stringToDate(value,'dd-mm-yyyy','-');
            if (!isValidDate(value)) {
                return null;
            }
        }
        console.log(value);
        console.log(`type %s : %o`, type, value);
        return value;
    } catch (error) {
        console.log(error);
    }
    
};

out.iData = async ({id, uuid, meta_data}, {type, input, output}, project_id, table_id) => {
    const sql = [];
    const params = [];
    const {table_name, column_value} = out.getTable(type);
    const value = out.getValue(input, meta_data, type);
    const uuid_row = uuid;
    const column_id = await out.getColumnId({
        project_id  : project_id,
        column_name : output,
        table_id    : table_id
    });
    
    if (column_id) {
        sql.push(`insert into ${table_name} (id, uuid, column_id, uuid_row, ${column_value}) values (?, ?, ?, ?, ?)`);

        params.push(id);
        params.push(uuid);
        params.push(column_id);
        params.push(uuid_row);
        if (table_name === 'idx_date_data' && value === 'string' && out.isValidDate(value)) {
            params.push(out.stringToDate(value, 'dd-mm-yyyy', '-'));

        } else {
            params.push(value);
        }
        

        await out.db.query(sql.join(' '), params);
    }
    
};

out.isValidDate = function (dateString) {
    var regEx = /^\d{2}-\d{2}-\d{4}$/;
    return (dateString.match(regEx) != null);
};

out.formattedYYYYMMDD = function (dateString) {
    try {
        let temp = null;
        const dateParts = dateString.split("-");
        temp = new Date(+dateParts[0], dateParts[1] - 1, +dateParts[2]);
        const d = temp.getDate();
        const m = temp.getMonth() + 1; //Month from 0 to 11
        const y = temp.getFullYear();
        return '' + y + '-' + (m <= 9 ? '0' + m : m) + '-' +  (d <= 9 ? '0' + d : d);
        
    } catch (error) {
        console.log(error);
    }
    return null;
};

out.dData = async ({id, type}) => {
    const sql = [];
    const params = [];
    const {table_name} = out.getTable(type);
    
    sql.push(`delete from ${table_name}`);
    sql.push(`where id        = ?`);

    params.push(id);

    console.log(sql.join(' '));
    console.log(params);
    await out.db.query(sql.join(' '), params);
};

out.dAll = async (id) => {
    const queue = [];
    const allTable = Object.keys(out.dataTable);

    for (const type of allTable) {
        queue.push(out.dData({id :id, type:type}));
    }
    await Promise.all(queue);   
};

out.getColumnId = async ({table_id, project_id, column_name}) => {
    const sql = [];
    const params = [];
    
    sql.push(`select    id`);
    sql.push(`from      system_data`);
    sql.push(`where     parent_id   = ?`);
    sql.push(`and       project_id  = ?`);
    sql.push(`and       str_keys    like concat(?, '%')`);
    sql.push(`limit 1`);

    params.push(table_id);
    params.push(project_id);
    params.push(`column_${column_name}`);

    const result = await out.db.query(sql.join(' '), params);

    if (result && Array.isArray(result) && result.length > 0) {
        return result[0].id;
    }
    return null;
};


function stringToDate(_date, _format, _delimiter) {
    const formatLowerCase = _format.toLowerCase();
    const formatItems     = formatLowerCase.split(_delimiter);
    const dateItems       = _date.split(_delimiter);
    const monthIndex      = formatItems.indexOf("mm");
    const dayIndex        = formatItems.indexOf("dd");
    const yearIndex       = formatItems.indexOf("yyyy");
    let month           = parseInt(dateItems[monthIndex]);
    month -= 1;
    const formattedDate = new Date(dateItems[yearIndex],month,dateItems[dayIndex]);
    return formattedDate;
}

function isValidDate(date) {
    return date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date);
}
module.exports = out;