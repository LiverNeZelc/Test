const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


function addUser(userLogin, userPassword) {
  const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "testdb",
    password: "8765зыштф"
  });

  const hashedPassword = bcrypt.hashSync(userPassword, 7);
  const query = "INSERT INTO user (userLogin, userPassword) VALUES (?, ?)";

  connection.execute(query, [userLogin, hashedPassword], function (err, results) {
    if (err) {
      console.error("Ошибка при добавлении пользователя:", err);
      connection.end();
      return;
    }
    console.log("Пользователь добавлен с ID:", results.insertId);
    connection.end();
  });
}


function promptUser() {
  rl.question("Введите логин: ", (userLogin) => {
    rl.question("Введите пароль: ", (userPassword) => {
      addUser(userLogin, userPassword);
      rl.close(); 
    });
  });
}

promptUser();