
const out = {
    db : null,
    schemas : null
};

out.init = (db, schemas = 'quicktask') => {
    out.db = db;
    out.schemas = schemas;
}

out.insertKeys = async (project_id, strKeys) => {
    const sql = [];
    const params = [project_id, strKeys];

    sql.push(`insert into ${out.schemas}.system_data (project_id, str_keys) values (?, ?)`);

    await out.db.query(sql.join(' '), params);
}


out.getTableId = async (project_id, table_name) => {
    const sql = [];
    const params = [project_id, `table_${table_name}`];

    sql.push(`select id`);
    sql.push(`from  ${out.schemas}.system_data`);
    sql.push(`where project_id = ?`);
    sql.push(`and   table_name = ?`);
    sql.push(`limit 1`);

    await out.db.query(sql.join(' '), params);
}

out.getTableId = async (project_id, table_name) => {
    const sql = [];
    const params = [project_id, `table_${table_name}`];

    sql.push(`select id`);
    sql.push(`from  ${out.schemas}.system_data`);
    sql.push(`where project_id = ?`);
    sql.push(`and   str_keys = ?`);
    sql.push(`limit 1`);

    await out.db.query(sql.join(' '), params);
}

out.getListCategory = async (project_id, categoryName) => {
    const sql = [];
    const params = [project_id, `category_${categoryName}`];

    sql.push(`select *`);
    sql.push(`from  ${out.schemas}.system_data`);
    sql.push(`where parent_id   in (`);
    sql.push(`          select id`);
    sql.push(`          from  ${out.schemas}.system_data`);
    sql.push(`          where project_id  = ?`);
    sql.push(`          and   str_keys    = ?`);
    sql.push(`      )`);

    const result = await out.db.query(sql.join(' '), params);
    const list = [];
    for (let i = 0; i < result.length; i++) {
        const {id, meta_data} = result[i];
        list.push({
            value : id,
            text : meta_data.name
        })
    }
    const output = {};
    output[categoryName] = list;
    return output;
}

module.exports = out;