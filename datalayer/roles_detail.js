
const out = {
    db : null,
    schemas : null
};

out.init = (db, schemas = 'system_user') => {
    out.db = db;
    out.schemas = schemas;
}

out.updateRoles = async (id, email, role_id, meta_data) => {
    const sql = [];
    const params = [];

    sql.push(`update    ${out.schemas}.roles_detail`);
    sql.push(`set       updated_by  = ?,`);
    sql.push(`          meta_data  = ?`);
    sql.push(`where     role_id = ?`);
    sql.push(`and       id = ?`);

    params.push(email);
    params.push(JSON.stringify(meta_data));
    params.push(role_id);
    params.push(id);

    const result = await out.db.query(sql.join(' '), params);

    return result || {};
}

out.deleteRole = async (role_id, id) => {
    const sql = [];
    const params = [];

    sql.push(`delete from ${out.schemas}.roles_detail`);
    sql.push(`where role_id = ?`);
    params.push(role_id);

    if (id) {
        sql.push(`and id = ?`);
        params.push(id);
    }

    const result = await out.db.query(sql.join(' '), params);

    return result || {};
}

out.inserRoles = async (email, role_id, meta_data) => {
    const sql = [];
    const params = [];

    sql.push(`insert into roles_detail  (`);
    sql.push(`updated_by,`);
    sql.push(`created_by,`);
    sql.push(`role_id,`);
    sql.push(`meta_data`);
    sql.push(`) values (`);
    sql.push(`?, ?, ?, ?`);
    sql.push(`)`);
    params.push(email);
    params.push(email);
    params.push(role_id);
    params.push(JSON.stringify(meta_data));

    const result = await out.db.query(sql.join(' '), params);

    return result || {};
}

out.getRolesDetail = async (role_id, id) => {
    const sql = [];
    const params = [];

    sql.push(`select   *`);
    sql.push(`from      ${out.schemas}.roles_detail`);
    sql.push(`where role_id = ?`);
    params.push(role_id);

    if (id) {
        sql.push(`and id = ?`);
        params.push(id);
    }

    const result = await out.db.query(sql.join(' '), params);

    return result || {};
}

module.exports = out;