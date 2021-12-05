
const out = {
    db : null,
    schemas : null
};

out.init = (db, schemas = 'system_user') => {
    out.db = db;
    out.schemas = schemas;
}

out.deleteRole = async (user_id) => {
    const sql = [];
    const params = [];

    sql.push(`delete from ${out.schemas}.user_roles`);
    sql.push(`where user_id = ?`);

    params.push(user_id);

    const result = await out.db.query(sql.join(' '), params);

    return result || {};
}

out.inserRoles = async (email, user_id, role_id, description) => {
    const sql = [];
    const params = [];

    sql.push(`insert into user_roles  (`);
    sql.push(`updated_by,`);
    sql.push(`created_by,`);
    sql.push(`desciption,`);
    sql.push(`user_id,`);
    sql.push(`role_id`);
    sql.push(`) values (`);
    sql.push(`?, ?, ?, ?, ?`);
    sql.push(`)`);
    params.push(email);
    params.push(email);
    params.push(description);
    params.push(user_id);
    params.push(role_id);

    const result = await out.db.query(sql.join(' '), params);

    return result || {};
}

out.getUserRoles = async (user_id) => {
    const sql = [];
    const params = [];

    sql.push(`select   *`);
    sql.push(`from      ${out.schemas}.user_roles`);

    if (user_id) {
        sql.push(`where user_id = ?`);
        params.push(user_id);
    }

    const result = await out.db.query(sql.join(' '), params);

    return result || {};
}

module.exports = out;