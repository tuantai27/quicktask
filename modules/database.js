const mysql = require('mysql2');

class database {    
    constructor() {  
        this.connection = mysql.createConnection({
            host        : 'localhost',
            user        : 'root',
            port        : 3306,
            password    : "tuanT@I4567",
            database    : 'quicktask'
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
}

module.exports = database;