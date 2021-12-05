
const out = {
    db : null,
    schemas : null
};

out.init = (db, schemas = 'quicktask') => {
    out.db = db;
    out.schemas = schemas;
}

out.deleteCategory = async (id) => {
    const sql = [];
    const params = [];

    sql.push(`delete from categories`);
    sql.push(`where id = ?`);

    params.push(id);

    const result = await out.db.query(sql.join(' '), params);

    return result[0] || {};
}

out.updateCategory = async (id, code, name, description, email) => {
    const sql = [];
    const params = [];

    sql.push(`update categories`);
    sql.push(`set   code = ?,`);
    sql.push(`      name = ?,`);
    sql.push(`      description = ?,`);
    sql.push(`      updated_by = ?`);
    sql.push(`where id = ?`);

    params.push(code);
    params.push(name);
    params.push(desciption);
    params.push(email);
    params.push(id);

    const result = await out.db.query(sql.join(' '), params);

    return result[0] || {};
}

out.insertCategory = async (code, name, description, email) => {
    const sql = [];
    const params = [];

    sql.push(`insert into categories (`);
    sql.push(`code,`);
    sql.push(`name,`);
    sql.push(`description,`);
    sql.push(`created_by,`);
    sql.push(`updated_by`);
    sql.push(`) values (`);
    sql.push(`?, ?, ?, ?, ?`);
    sql.push(`)`);

    params.push(code);
    params.push(name);
    params.push(description);
    params.push(email);
    params.push(email);

    const result = await out.db.query(sql.join(' '), params);

    return result || {};
}


out.getCategories = async (code) => {
    const sql = [];
    const params = [];

    sql.push(`select   *`);
    sql.push(`from      ${out.schemas}.categories`);

    if (code) {
        sql.push(`where code = ?`);
        params.push(code);
    }

    const result = await out.db.query(sql.join(' '), params);

    return result || {};
}

module.exports = out;