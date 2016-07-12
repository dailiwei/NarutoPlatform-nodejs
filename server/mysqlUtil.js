
var mysql = require('mysql');
function mysqlUtil() {
    var name;
    var conn;
    this.connect = function() {
        var conn = mysql.createConnection({
            host: '182.92.180.113',
            user: 'root',
            password: 'richway',
            database:'RW_MARK',
            port: 3306
        });
        conn.connect();
        console.log("connect");
    };
    this.query = function() {
        conn.query('select id,title,user,ps,tm from mark', function(err, rows, fields) {
            if (err) throw err;
            console.dir(rows);
        });
    };
    this.end = function(){
        conn.end();
    }
};
module.exports = mysqlUtil;