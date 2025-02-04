const express = require("express");
const app = express();
const bcrypt = require('bcryptjs');
const getIPv4Addresses = require('./getIpAddresses');

const port = 3000;
const ipAddress = getIPv4Addresses();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/general", express.static("D:/GitHub/Test"));

app.post("/submit", function (request, response) {
    const { userLogin, userPassword } = request.body;

    if (!userLogin || !userPassword) {
        return response.sendStatus(400);
    }

    const hashPassword = bcrypt.hashSync(userPassword, 7);

    console.log(`${userLogin} - ${hashPassword}`);
    response.json({ login: userLogin, hashPassword: hashPassword });
});

app.listen(port, ipAddress, () => {
    console.log(`Сервер запущен по адресу http://${ipAddress}:${port}`);
  });