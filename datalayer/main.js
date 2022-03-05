const { v4: uuidv4 } = require('uuid');
const index_data = require('./index_data');

const out = {
    db : null,
    schemas : null
};

out.init = (db, schemas = 'quicktask') => {
    out.db = db;
    out.schemas = schemas;
    index_data.init(db);
}

out.addIndex = async (index, insertId, {project_id, uuid, table_id, meta_data}) => {
    await index_data.dAll(insertId);
    meta_data = JSON.parse(meta_data);
    for (let i = 0; i < index.length; i++) {
        index_data.iData({id : insertId, uuid : uuid, meta_data : meta_data}, index[i], project_id, table_id)
    }
}

out.iData = async ({project_id, uuid, table_id, meta_data, UserId}, index) => {
    const sql = [];
    const params = [];
    
    sql.push(`insert into all_data_table (project_id, uuid, table_id, meta_data, updated_by, created_by) values (?, ?, ?, ?, ?, ?)`);

    params.push(project_id);
    params.push(uuid);
    params.push(table_id);
    if (typeof meta_data === "string") {
        params.push(meta_data);
    } else {
        params.push(JSON.stringify(meta_data));
    }
    
    params.push(UserId);
    params.push(UserId);

    const result = await out.db.query(sql.join(' '), params);
    const {insertId} = result;
    console.log(result);

    if (index && Array.isArray(index) && index.length > 0) {
        out.addIndex(index, insertId, {project_id, uuid, table_id, meta_data});
    }
};

out.isUUID = function ( uuid ) {
    let s = "" + uuid;
    s = s.match('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$');
    if (s === null) {
      return false;
    }
    return true;
}

out.createUUID = function () {
    return uuidv4();
}

out.uData = async ({project_id, uuid, table_id, meta_data, UserId}, index) => {
    const sql = [];
    const params = [];
    
    sql.push(`update all_data_table`);
    sql.push(`set   meta_data   = ?`);
    sql.push(`where uuid        = ?`);
    sql.push(`and   table_id    = ?`);
    sql.push(`and   project_id  = ?`);
    sql.push(`and   updated_by  = ?`);

    if (typeof meta_data === "string") {
        params.push(meta_data);
    } else {
        params.push(JSON.stringify(meta_data));
    }
    params.push(uuid);
    params.push(table_id);
    params.push(project_id);
    params.push(UserId);

    console.log(sql.join(' '));
    console.log(params);
    await out.db.query(sql.join(' '), params);
    
    if (index && Array.isArray(index) && index.length > 0) {
        const id = await out.getRowID({project_id, uuid, table_id});
        if (id) {
            out.addIndex(index, id, {project_id, uuid, table_id, meta_data});
        }
    }
};


out.dData = async ({project_id, uuid, table_id}) => {
    const sql = [];
    const params = [];
    
    sql.push(`delete from all_data_table`);
    sql.push(`where uuid        = ?`);
    sql.push(`and   project_id  = ?`);
    sql.push(`and   table_id    = ?`);

    params.push(uuid);
    params.push(project_id);
    params.push(table_id);

    await out.db.query(sql.join(' '), params);
    const id = await out.getRowID({project_id, uuid, table_id});
    if (id) {
        await index_data.dAll(id);
    }
    
};

out.getTableId = async ({table_name, project_id}) => {
    const sql = [];
    const params = [];
    
    sql.push(`select    id`);
    sql.push(`from      system_data`);
    sql.push(`where     project_id  = ?`);
    sql.push(`and       str_keys    = ?`);
    sql.push(`limit 1`);

    params.push(project_id);
    params.push(`table_${table_name}`);

    const result = await out.db.query(sql.join(' '), params);

    if (result && Array.isArray(result) && result.length > 0) {
        return result[0].id;
    }
    return null;
};

out.getRow = async ({project_id, uuid, table_id}) => {
    const sql = [];
    const params = [];
    
    sql.push(`select    meta_data`);
    sql.push(`from      all_data_table`);
    sql.push(`where     uuid        = ?`);
    sql.push(`and       project_id  = ?`);
    sql.push(`and       table_id    = ?`);
    sql.push(`limit 1`);

    params.push(uuid);
    params.push(project_id);
    params.push(table_id);
    console.log(sql.join(' \n '));
    console.log(params);
    const result = await out.db.query(sql.join(' \n '), params);
    if (result && Array.isArray(result) && result.length > 0) {
        return result[0].meta_data;
    }
    return null;
};

out.getRowID = async ({project_id, uuid, table_id}) => {
    const sql = [];
    const params = [];
    
    sql.push(`select    id`);
    sql.push(`from      all_data_table`);
    sql.push(`where     uuid        = ?`);
    sql.push(`and       project_id  = ?`);
    sql.push(`and       table_id    = ?`);
    sql.push(`limit 1`);

    params.push(uuid);
    params.push(project_id);
    params.push(table_id);
    console.log(sql.join(' \n '));
    console.log(params);
    const result = await out.db.query(sql.join(' \n '), params);
    if (result && Array.isArray(result) && result.length > 0) {
        return result[0].id;
    }
    return null;
};

module.exports = out;