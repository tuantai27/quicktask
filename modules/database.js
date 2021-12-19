const mysql = require('mysql2');

class database {    
    constructor(config) {  
        this.connection = mysql.createConnection({
            host        : config.MYSQL_DB.host,
            user        : config.MYSQL_DB.user,
            port        : config.MYSQL_DB.port,
            password    : config.MYSQL_DB.password,
            database    : config.MYSQL_DB.database
        });
    }
    query(sql, params) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql,params,
                function(err, results) {
                    if (err) {
                        reject(err);
                    }
                    resolve(results);
                }
            );
        });
    }
    getTransaction () {
        return this.connection.beginTransaction();

    }
    commit () {
        
    }
}

module.exports = database;