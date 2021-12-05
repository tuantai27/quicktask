
const out = {
    db : null,
    schemas : null
};

out.init = (db, schemas = 'system_user') => {
    out.db = db;
    out.schemas = schemas;
}

out.updateRoles = async (id, email, role_name, desciption) => {
    const sql = [];
    const params = [];

    sql.push(`update    ${out.schemas}.roles`);
    sql.push(`set       updated_by  = ?,`);
    sql.push(`          role_name   = ?,`);
    sql.push(`          desciption  = ?`);
    sql.push(`where     id = ?`);

    params.push(email);
    params.push(role_name);
    params.push(desciption);
    params.push(id);

    const result = await out.db.query(sql.join(' '), params);

    return result || {};
}

out.deleteRole = async (id) => {
    const sql = [];
    const params = [];

    sql.push(`delete from ${out.schemas}.roles`);
    sql.push(`where id = ?`);

    params.push(id);

    const result = await out.db.query(sql.join(' '), params);

    return result || {};
}

out.inserRoles = async (email, role_name, description) => {
    const sql = [];
    const params = [];

    sql.push(`insert into roles  (`);
    sql.push(`updated_by,`);
    sql.push(`created_by,`);
    sql.push(`role_name,`);
    sql.push(`desciption`);
    sql.push(`) values (`);
    sql.push(`?, ?, ?, ?`);
    sql.push(`)`);
    params.push(email);
    params.push(email);
    params.push(role_name);
    params.push(description);

    const result = await out.db.query(sql.join(' '), params);

    return result || {};
}

out.getRoles = async (id) => {
    const sql = [];
    const params = [];

    sql.push(`select   *`);
    sql.push(`from      ${out.schemas}.roles`);

    if (id) {
        sql.push(`where id = ?`);
        params.push(id);
    }

    const result = await out.db.query(sql.join(' '), params);

    return result || {};
}

module.exports = out;