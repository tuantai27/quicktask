
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

    sql.push(`delete from categories_detail`);
    sql.push(`where id = ?`);

    params.push(id);

    const result = await out.db.query(sql.join(' '), params);

    return result || {};
}

out.updateCategory = async (id, category_id, value, name, description, email) => {
    const sql = [];
    const params = [];

    sql.push(`update categories_detail`);
    sql.push(`set   value = ?,`);
    sql.push(`      name = ?,`);
    sql.push(`      description = ?,`);
    sql.push(`      updated_by = ?`);
    sql.push(`where id = ?`);
    sql.push(`and   category_id = ?`);

    params.push(code);
    params.push(name);
    params.push(desciption);
    params.push(email);
    params.push(id);
    params.push(category_id);

    const result = await out.db.query(sql.join(' '), params);

    return result || {};
}

out.insertCategory = async (category_id, value, name, email) => {
    const sql = [];
    const params = [];

    sql.push(`insert into categories_detail (`);
    sql.push(`category_id,`);
    sql.push(`value,`);
    sql.push(`name,`);
    sql.push(`created_by,`);
    sql.push(`updated_by`);
    sql.push(`) values (`);
    sql.push(`?, ?, ?, ?, ?, ?`);
    sql.push(`)`);

    params.push(category_id);
    params.push(value);
    params.push(name);
    params.push(description);
    params.push(email);
    params.push(email);

    const result = await out.db.query(sql.join(' '), params);

    return result || {};
}


out.getCategoriesDetail = async (category_id, id) => {
    const sql = [];
    const params = [];

    sql.push(`select   *`);
    sql.push(`from      ${out.schemas}.categories_detail`);
    sql.push(`where     category_id = ?`);
    params.push(category_id);

    if (id) {
        sql.push(`and id = ?`);
        params.push(id);
    }

    const result = await out.db.query(sql.join(' '), params);

    return result || {};
}

module.exports = out;