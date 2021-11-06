
const out = {
    db : null,
    schemas : null
};

out.init = (db, schemas = 'system_user') => {
    out.db = db;
    out.schemas = schemas;
}

out.checkUser = async (email, password) => {
    const sql = [];
    const params = [];

    sql.push(`select   *`);
    sql.push(`from      ${out.schemas}.users`);
    sql.push(`where     email = ?`);
    sql.push(`and       password = ?`);

    params.push(email);
    params.push(password);

    const result = await out.db.query(sql.join(' '), params);

    return result[0] || {};
}

module.exports = out;