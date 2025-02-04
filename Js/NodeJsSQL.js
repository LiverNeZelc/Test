const mysql = require("mysql2");
  
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "testdb",
  password: "8765зыштф"
});
 
connection.execute("SELECT * FROM user",
  function(err, results, fields) {
    console.log(err);
    console.log(results); 
    console.log(fields); 
});
connection.end();