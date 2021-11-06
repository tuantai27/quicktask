
const out = {
    db : null,
    schemas : null
};

out.init = (db, schemas = 'quicktask') => {
    out.db = db;
    out.schemas = schemas;
}

out.insertSalary = async ({email, emailBcc, monthly, name, status_name, uuid, comment}) => {
    const sql       = [`insert into ${out.schemas}.salary (email, emailBcc, monthly, name, status_name, uuid, comment) VALUES (?, ?, ?, ?, ?, ?, ?)`];
    const params    = [];

    params.push(email);
    params.push(emailBcc);
    params.push(monthly);
    params.push(name);
    params.push(status_name);
    params.push(uuid);
    params.push(comment);

    await out.db.query(sql.join(' '), params);
}

out.updateSalary = async ({email, emailBcc, monthly, name, status_name, uuid, comment, has_file}) => {
    const sql       = [];
    const params    = [];

    sql.push(`UPDATE    ${out.schemas}.salary`);
    sql.push(`SET       status_name = case when status_name = 'Đã Xác nhận.' then status_name else ? end`);
    params.push(status_name);

    if (comment) {
        sql.push(` ,comment = ?`);
        params.push(comment);
    }

    if (has_file) {
        sql.push(` ,has_file = ?`);
        params.push(has_file);
    }

    if (email) {
        sql.push(` ,email = ?`);
        params.push(email);
    }

    if (emailBcc) {
        sql.push(` ,emailBcc = ?`);
        params.push(emailBcc);
    }

    if (monthly) {
        sql.push(` ,monthly = ?`);
        params.push(monthly);
    }

    if (name) {
        sql.push(` ,name = ?`);
        params.push(name);
    }

    sql.push(`WHERE     uuid = ?`);
    
    params.push(uuid);

    await out.db.query(sql.join(' '), params);
}

out.selectSalary = async (uuid) => {
    const sql       = [];
    const params    = [];

    sql.push(`SELECT    *`);
    sql.push(`FROM      ${out.schemas}.salary`);
    sql.push(`WHERE     uuid = ?`);
    params.push(uuid);

    return await out.db.query(sql.join(' '), params);
}

out.selectSalaryMonthly = async (monthly) => {
    const sql       = [];
    const params    = [];

    sql.push(`SELECT    *`);
    sql.push(`FROM      ${out.schemas}.salary`);
    sql.push(`WHERE     lower(REPLACE( monthly, ' ', '' )) = ?`);
    params.push(monthly.replace(/ /g, '').toLocaleLowerCase());

    return await out.db.query(sql.join(' '), params);
}

out.deleteSalary = async (uuid) => {
    const sql       = [];
    const params    = [];

    sql.push(`DELETE FROM ${out.schemas}.salary`);
    sql.push(`WHERE     uuid = ?`);
    params.push(uuid);

    return await out.db.query(sql.join(' '), params);
}

module.exports = out;